import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { EVENT_TYPE_HEADER } from '../../domain/constants/messaging.constants';
import { IInboundConsumerOptions } from '../../domain/interfaces/inbound-consumer-options.interface';
import { IInboundMessage } from '../../domain/interfaces/inbound-message.interface';
import { IEventConsumer } from '../../domain/ports/event-consumer.port';
import { IInboundErrorHandler } from '../../domain/ports/inbound-error-handler.port';
import { InboundConsumerBootstrapService } from './inbound-consumer-bootstrap.service';
import { InboundHandlerRegistry } from './inbound-handler-registry.service';

class OrderErrorHandler implements IInboundErrorHandler {
  onHandlerError = jest.fn().mockResolvedValue(undefined);
}

function makeMessage(
  overrides: Partial<IInboundMessage> = {},
): IInboundMessage {
  return {
    topic: 'svc.orders',
    partition: 0,
    key: 'order-1',
    headers: { [EVENT_TYPE_HEADER]: 'OrderCreated' },
    value: '{}',
    ...overrides,
  };
}

describe('InboundConsumerBootstrapService', () => {
  let eventConsumer: jest.Mocked<IEventConsumer>;
  let registry: jest.Mocked<InboundHandlerRegistry>;
  let moduleRef: jest.Mocked<ModuleRef>;
  let logErrorSpy: jest.SpyInstance;
  let logWarnSpy: jest.SpyInstance;
  let logLogSpy: jest.SpyInstance;

  beforeEach(() => {
    eventConsumer = { run: jest.fn().mockResolvedValue(undefined) };
    registry = {
      findHandlers: jest.fn(),
    } as unknown as jest.Mocked<InboundHandlerRegistry>;
    moduleRef = { get: jest.fn() } as unknown as jest.Mocked<ModuleRef>;
    logErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    logWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    logLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function build(
    consumers: IInboundConsumerOptions[],
  ): InboundConsumerBootstrapService {
    return new InboundConsumerBootstrapService(
      consumers,
      eventConsumer,
      registry,
      moduleRef,
    );
  }

  async function captureDispatch(
    service: InboundConsumerBootstrapService,
    callIndex = 0,
  ): Promise<(message: IInboundMessage) => Promise<void>> {
    await service.onApplicationBootstrap();
    return eventConsumer.run.mock.calls[callIndex][2] as (
      message: IInboundMessage,
    ) => Promise<void>;
  }

  it('calls run() once per declared groupId with its own topics', async () => {
    const consumers: IInboundConsumerOptions[] = [
      { groupId: 'orders', topics: ['svc.orders'] },
      {
        groupId: 'shipments',
        topics: ['svc.shipments', 'svc.shipments.retry'],
      },
    ];
    const service = build(consumers);

    await service.onApplicationBootstrap();

    expect(eventConsumer.run).toHaveBeenCalledTimes(2);
    expect(eventConsumer.run).toHaveBeenCalledWith(
      'orders',
      ['svc.orders'],
      expect.any(Function),
    );
    expect(eventConsumer.run).toHaveBeenCalledWith(
      'shipments',
      ['svc.shipments', 'svc.shipments.retry'],
      expect.any(Function),
    );
    expect(logWarnSpy).toHaveBeenCalled();
  });

  it('does not call run() when inboundConsumers is absent/empty', async () => {
    const service = build([]);

    await service.onApplicationBootstrap();

    expect(eventConsumer.run).not.toHaveBeenCalled();
    expect(logWarnSpy).not.toHaveBeenCalled();
  });

  it('routes a message to a handler matching topic and event-type header', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    registry.findHandlers.mockReturnValue([handler]);
    const service = build([{ groupId: 'orders', topics: ['svc.orders'] }]);
    const dispatch = await captureDispatch(service);
    const message = makeMessage();

    await dispatch(message);

    expect(registry.findHandlers).toHaveBeenCalledWith(
      'svc.orders',
      'OrderCreated',
    );
    expect(handler).toHaveBeenCalledWith(message);
  });

  it('routes by topic only (catch-all) when the event-type header is missing', async () => {
    registry.findHandlers.mockReturnValue([]);
    const service = build([{ groupId: 'orders', topics: ['svc.orders'] }]);
    const dispatch = await captureDispatch(service);

    await dispatch(makeMessage({ headers: {} }));

    expect(registry.findHandlers).toHaveBeenCalledWith('svc.orders', undefined);
  });

  it('drops a message with an unmatched event-type value without throwing', async () => {
    registry.findHandlers.mockReturnValue([]);
    const service = build([{ groupId: 'orders', topics: ['svc.orders'] }]);
    const dispatch = await captureDispatch(service);

    await expect(
      dispatch(
        makeMessage({ headers: { [EVENT_TYPE_HEADER]: 'UnknownType' } }),
      ),
    ).resolves.toBeUndefined();
    expect(logLogSpy).toHaveBeenCalled();
  });

  it('logs and drops a zero-match message while the consumer keeps running', async () => {
    registry.findHandlers.mockReturnValue([]);
    const service = build([{ groupId: 'orders', topics: ['svc.orders'] }]);
    const dispatch = await captureDispatch(service);

    await dispatch(makeMessage());

    expect(logLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('svc.orders'),
    );
  });

  it('invokes the configured errorHandler when a matched handler throws', async () => {
    const errorHandlerInstance = new OrderErrorHandler();
    moduleRef.get.mockReturnValue(errorHandlerInstance);
    const failure = new Error('boom');
    const handler = jest.fn().mockRejectedValue(failure);
    registry.findHandlers.mockReturnValue([handler]);

    const consumers: IInboundConsumerOptions[] = [
      {
        groupId: 'orders',
        topics: ['svc.orders'],
        errorHandler: OrderErrorHandler,
      },
    ];
    const service = build(consumers);
    const dispatch = await captureDispatch(service);
    const message = makeMessage();

    await dispatch(message);

    expect(moduleRef.get).toHaveBeenCalledWith(OrderErrorHandler, {
      strict: false,
    });
    expect(errorHandlerInstance.onHandlerError).toHaveBeenCalledWith({
      message,
      error: failure,
      groupId: 'orders',
      topic: 'svc.orders',
    });
  });

  it('logs and swallows a handler failure when no errorHandler is configured', async () => {
    const failure = new Error('boom');
    const handler = jest.fn().mockRejectedValue(failure);
    registry.findHandlers.mockReturnValue([handler]);
    const service = build([{ groupId: 'orders', topics: ['svc.orders'] }]);
    const dispatch = await captureDispatch(service);

    await expect(dispatch(makeMessage())).resolves.toBeUndefined();
    expect(logErrorSpy).toHaveBeenCalled();
  });

  it('swallows an error thrown by the errorHandler itself', async () => {
    class ThrowingErrorHandler implements IInboundErrorHandler {
      onHandlerError = jest.fn().mockRejectedValue(new Error('handler-failed'));
    }
    const errorHandlerInstance = new ThrowingErrorHandler();
    moduleRef.get.mockReturnValue(errorHandlerInstance);
    const handler = jest.fn().mockRejectedValue(new Error('boom'));
    registry.findHandlers.mockReturnValue([handler]);

    const consumers: IInboundConsumerOptions[] = [
      {
        groupId: 'orders',
        topics: ['svc.orders'],
        errorHandler: ThrowingErrorHandler,
      },
    ];
    const service = build(consumers);
    const dispatch = await captureDispatch(service);

    await expect(dispatch(makeMessage())).resolves.toBeUndefined();
    expect(errorHandlerInstance.onHandlerError).toHaveBeenCalled();
    expect(logErrorSpy).toHaveBeenCalled();
  });

  it('throws at bootstrap when the configured errorHandler class is not a registered provider', async () => {
    class UnregisteredErrorHandler implements IInboundErrorHandler {
      onHandlerError = jest.fn();
    }
    moduleRef.get.mockImplementation(() => {
      throw new Error(
        'UnregisteredErrorHandler is not registered as a provider',
      );
    });
    const consumers: IInboundConsumerOptions[] = [
      {
        groupId: 'orders',
        topics: ['svc.orders'],
        errorHandler: UnregisteredErrorHandler,
      },
    ];
    const service = build(consumers);

    await expect(service.onApplicationBootstrap()).rejects.toThrow(
      'UnregisteredErrorHandler is not registered as a provider',
    );
    expect(eventConsumer.run).not.toHaveBeenCalled();
  });

  it('sets isShuttingDown on module destroy and stops further dispatch', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    registry.findHandlers.mockReturnValue([handler]);
    const service = build([{ groupId: 'orders', topics: ['svc.orders'] }]);
    const dispatch = await captureDispatch(service);

    service.onModuleDestroy();
    await dispatch(makeMessage());

    expect(handler).not.toHaveBeenCalled();
  });
});
