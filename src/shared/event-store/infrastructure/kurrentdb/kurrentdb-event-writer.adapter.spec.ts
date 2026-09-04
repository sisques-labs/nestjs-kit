import { ConfigService } from '@nestjs/config';
import { jsonEvent, KurrentDBClient } from '@kurrent/kurrentdb-client';

import { IOutboundEvent } from '../../../messaging/domain/interfaces/outbound-event.interface';
import { IEventStoreConfig } from './event-store-config.interface';
import { KurrentDbEventWriterAdapter } from './kurrentdb-event-writer.adapter';

// Only `KurrentDBClient` is mocked — `jsonEvent` stays real so the shape
// assertions below exercise the actual envelope the adapter builds.
jest.mock('@kurrent/kurrentdb-client', () => ({
  ...jest.requireActual('@kurrent/kurrentdb-client'),
  KurrentDBClient: { connectionString: jest.fn() },
}));

const EVENT_STORE_CONFIG: IEventStoreConfig = {
  enabled: true,
  connectionString: 'kurrentdb://localhost:2113?tls=false',
  streamPrefix: 'my-service',
};

function makeOutboundEvent(
  overrides: Partial<IOutboundEvent> = {},
): IOutboundEvent {
  return {
    module: 'OrderAggregate',
    action: 'order-updated',
    eventType: 'OrderUpdatedEvent',
    eventId: 'evt-1',
    aggregateRootId: 'order-1',
    aggregateRootType: 'OrderAggregate',
    entityId: 'order-1',
    entityType: 'OrderAggregate',
    schemaVersion: '1',
    occurredAt: new Date('2026-06-25T00:00:00.000Z'),
    correlationId: null,
    causationId: null,
    data: { id: 'order-1', total: 42 },
    ...overrides,
  };
}

describe('KurrentDbEventWriterAdapter', () => {
  const client = {
    appendToStream: jest.fn().mockResolvedValue(undefined),
    dispose: jest.fn().mockResolvedValue(undefined),
  };
  let adapter: KurrentDbEventWriterAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    (KurrentDBClient.connectionString as jest.Mock).mockReturnValue(client);

    const configService = {
      getOrThrow: jest.fn().mockReturnValue(EVENT_STORE_CONFIG),
    } as unknown as ConfigService;

    adapter = new KurrentDbEventWriterAdapter(configService);
  });

  it('appends to ${streamPrefix}-${aggregateRootType}-${aggregateRootId}', async () => {
    await adapter.append(makeOutboundEvent());

    expect(client.appendToStream).toHaveBeenCalledTimes(1);
    const [stream] = client.appendToStream.mock.calls[0];
    expect(stream).toBe('my-service-OrderAggregate-order-1');
  });

  it('builds a jsonEvent keyed by the kebab-cased action, carrying metadata', async () => {
    await adapter.append(makeOutboundEvent());

    const [, event] = client.appendToStream.mock.calls[0];
    expect(event).toEqual(
      jsonEvent({
        id: 'evt-1',
        type: 'order-updated',
        data: { id: 'order-1', total: 42 },
        metadata: expect.objectContaining({
          eventType: 'OrderUpdatedEvent',
          aggregateRootType: 'OrderAggregate',
          occurredAt: '2026-06-25T00:00:00.000Z',
        }),
      }),
    );
  });

  it('disposes the client on destroy', async () => {
    await adapter.onModuleDestroy();
    expect(client.dispose).toHaveBeenCalledTimes(1);
  });

  describe('when the event store is disabled', () => {
    let disabledAdapter: KurrentDbEventWriterAdapter;

    beforeEach(() => {
      (KurrentDBClient.connectionString as jest.Mock).mockClear();
      const configService = {
        getOrThrow: jest
          .fn()
          .mockReturnValue({ ...EVENT_STORE_CONFIG, enabled: false }),
      } as unknown as ConfigService;
      disabledAdapter = new KurrentDbEventWriterAdapter(configService);
    });

    it('never creates a KurrentDB client', () => {
      expect(KurrentDBClient.connectionString).not.toHaveBeenCalled();
    });

    it('is a no-op on append and destroy', async () => {
      await disabledAdapter.append(makeOutboundEvent());
      await disabledAdapter.onModuleDestroy();

      expect(client.appendToStream).not.toHaveBeenCalled();
      expect(client.dispose).not.toHaveBeenCalled();
    });
  });
});
