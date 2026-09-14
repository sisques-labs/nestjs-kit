import { ConfigService } from '@nestjs/config';
import { EventBus, IEvent } from '@nestjs/cqrs';

import { IEventStoreWriter } from '../../domain/ports/event-store-writer.port';
import { EventStoreForwarderService } from './event-store-forwarder.service';

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

describe('EventStoreForwarderService', () => {
  let eventBus: jest.Mocked<EventBus>;
  let configService: jest.Mocked<ConfigService>;
  let writer: jest.Mocked<IEventStoreWriter>;
  let service: EventStoreForwarderService;
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

    writer = {
      append: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<IEventStoreWriter>;

    service = new EventStoreForwarderService(eventBus, configService, writer);
  });

  describe('when the event store is disabled', () => {
    it('does not subscribe to the EventBus', () => {
      configService.get.mockReturnValue({ enabled: false });

      service.onModuleInit();

      expect(eventBus.subscribe).not.toHaveBeenCalled();
    });
  });

  describe('when the event store is enabled', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('subscribes to the EventBus', () => {
      expect(eventBus.subscribe).toHaveBeenCalledTimes(1);
    });

    it('forwards a domain event as a normalized outbound event', async () => {
      capturedHandler?.(makeDomainEvent());
      await Promise.resolve();

      expect(writer.append).toHaveBeenCalledTimes(1);
      expect(writer.append).toHaveBeenCalledWith(
        expect.objectContaining({
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

    it('ignores non-domain events (no metadata fields)', async () => {
      capturedHandler?.({ foo: 'bar' } as unknown as IEvent);
      await Promise.resolve();

      expect(writer.append).not.toHaveBeenCalled();
    });

    it('swallows append failures (best-effort)', async () => {
      const error = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => undefined);
      writer.append.mockRejectedValueOnce(new Error('instance down'));

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
