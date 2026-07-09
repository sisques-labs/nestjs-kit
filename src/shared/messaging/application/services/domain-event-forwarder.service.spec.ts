import { ConfigService } from '@nestjs/config';
import { EventBus, IEvent } from '@nestjs/cqrs';

import { EventRoutingService } from '../../domain/routing/event-routing.service';
import { IEventPublisher } from '../../domain/ports/event-publisher.port';
import { DomainEventForwarderService } from './domain-event-forwarder.service';

function makeDomainEvent(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    eventId: 'evt-1',
    eventType: 'OrderUpdatedEvent',
    aggregateRootId: 'order-1',
    aggregateRootType: 'OrderAggregate',
    entityId: 'order-1',
    entityType: 'OrderAggregate',
    schemaVersion: '1',
    ocurredAt: new Date('2026-06-25T00:00:00.000Z'),
    correlationId: null,
    causationId: null,
    data: { id: 'order-1', total: 42 },
    ...overrides,
  } as unknown as IEvent;
}

describe('DomainEventForwarderService', () => {
  let eventBus: jest.Mocked<EventBus>;
  let configService: jest.Mocked<ConfigService>;
  let eventRouting: jest.Mocked<EventRoutingService>;
  let publisher: jest.Mocked<IEventPublisher>;
  let service: DomainEventForwarderService;
  let capturedHandler: ((event: IEvent) => void) | undefined;
  const unsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    capturedHandler = undefined;

    eventBus = {
      subscribe: jest.fn((handler: (event: IEvent) => void) => {
        capturedHandler = handler;
        return { unsubscribe } as never;
      }),
    } as unknown as jest.Mocked<EventBus>;

    configService = {
      get: jest.fn().mockReturnValue({ enabled: true }),
    } as unknown as jest.Mocked<ConfigService>;

    eventRouting = {
      resolveModule: jest
        .fn()
        .mockReturnValue({ module: 'orders', fallback: false }),
    } as unknown as jest.Mocked<EventRoutingService>;

    publisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<IEventPublisher>;

    service = new DomainEventForwarderService(
      eventBus,
      configService,
      eventRouting,
      publisher,
    );
  });

  describe('when Kafka is disabled', () => {
    it('does not subscribe to the EventBus', () => {
      configService.get.mockReturnValue({ enabled: false });

      service.onModuleInit();

      expect(eventBus.subscribe).not.toHaveBeenCalled();
    });
  });

  describe('when Kafka is enabled', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('subscribes to the EventBus', () => {
      expect(eventBus.subscribe).toHaveBeenCalledTimes(1);
    });

    it('forwards a domain event as a normalized outbound event', async () => {
      capturedHandler?.(makeDomainEvent());
      await Promise.resolve();

      expect(eventRouting.resolveModule).toHaveBeenCalledWith('OrderAggregate');
      expect(publisher.publish).toHaveBeenCalledTimes(1);
      expect(publisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'orders',
          action: 'order-updated',
          eventType: 'OrderUpdatedEvent',
          eventId: 'evt-1',
          aggregateRootId: 'order-1',
          aggregateRootType: 'OrderAggregate',
          occurredAt: new Date('2026-06-25T00:00:00.000Z'),
          data: { id: 'order-1', total: 42 },
        }),
      );
    });

    it('routes an unmapped aggregate to the unmapped module and warns once', async () => {
      eventRouting.resolveModule.mockReturnValue({
        module: 'unmapped',
        fallback: true,
      });
      const warn = jest
        .spyOn(service['logger'], 'warn')
        .mockImplementation(() => undefined);

      capturedHandler?.(
        makeDomainEvent({ aggregateRootType: 'MysteryAggregate' }),
      );
      capturedHandler?.(
        makeDomainEvent({ aggregateRootType: 'MysteryAggregate' }),
      );
      await Promise.resolve();

      expect(publisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({ module: 'unmapped' }),
      );
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('ignores non-domain events (no metadata fields)', async () => {
      capturedHandler?.({ foo: 'bar' } as unknown as IEvent);
      await Promise.resolve();

      expect(publisher.publish).not.toHaveBeenCalled();
    });

    it('swallows publish failures (best-effort)', async () => {
      const error = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => undefined);
      publisher.publish.mockRejectedValueOnce(new Error('broker down'));

      expect(() => capturedHandler?.(makeDomainEvent())).not.toThrow();
      await Promise.resolve();
      await Promise.resolve();

      expect(error).toHaveBeenCalledTimes(1);
    });
  });

  it('unsubscribes on destroy', () => {
    service.onModuleInit();

    service.onModuleDestroy();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
