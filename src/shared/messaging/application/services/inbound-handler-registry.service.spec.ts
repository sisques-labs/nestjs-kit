import { Logger } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

import { KAFKA_MESSAGE_HANDLER_METADATA } from '../../domain/constants/messaging.constants';
import { InboundHandlerRegistry } from './inbound-handler-registry.service';

interface IHandlerMetadata {
  topic: string;
  eventType?: string;
}

class OrdersHandlerProvider {
  readonly marker = 'orders-instance';

  handleOrderCreated(): Promise<string> {
    return Promise.resolve(this.marker);
  }

  handleOrdersCatchAll(): Promise<string> {
    return Promise.resolve(this.marker);
  }

  notAHandler(): void {}
}

class ShipmentsHandlerProvider {
  handleShipmentDispatched(): Promise<void> {
    return Promise.resolve();
  }
}

class UndecoratedProvider {
  doSomething(): void {}
}

describe('InboundHandlerRegistry', () => {
  const metadataMap = new Map<unknown, IHandlerMetadata>([
    [
      OrdersHandlerProvider.prototype.handleOrderCreated,
      { topic: 'svc.orders', eventType: 'OrderCreated' },
    ],
    [
      OrdersHandlerProvider.prototype.handleOrdersCatchAll,
      { topic: 'svc.orders' },
    ],
    [
      ShipmentsHandlerProvider.prototype.handleShipmentDispatched,
      { topic: 'svc.shipments', eventType: 'ShipmentDispatched' },
    ],
  ]);

  function buildRegistry(
    providers: Array<{ instance: unknown }>,
  ): InboundHandlerRegistry {
    const discoveryService = {
      getProviders: jest.fn().mockReturnValue(providers),
    } as unknown as jest.Mocked<DiscoveryService>;

    const metadataScanner = {
      getAllMethodNames: jest.fn((prototype: object) =>
        Object.getOwnPropertyNames(prototype).filter(
          (name) => name !== 'constructor',
        ),
      ),
    } as unknown as jest.Mocked<MetadataScanner>;

    const reflector = {
      get: jest.fn((key: unknown, target: unknown) =>
        key === KAFKA_MESSAGE_HANDLER_METADATA
          ? metadataMap.get(target)
          : undefined,
      ),
    } as unknown as jest.Mocked<Reflector>;

    return new InboundHandlerRegistry(
      discoveryService,
      metadataScanner,
      reflector,
    );
  }

  it('discovers decorated handlers across multiple providers and indexes them by topic/eventType', () => {
    const registry = buildRegistry([
      { instance: new OrdersHandlerProvider() },
      { instance: new ShipmentsHandlerProvider() },
    ]);

    registry.onModuleInit();

    expect(
      registry.findHandlers('svc.shipments', 'ShipmentDispatched'),
    ).toHaveLength(1);
    expect(registry.findHandlers('svc.orders', 'OrderCreated')).toHaveLength(2);
  });

  it('ignores provider methods without KafkaMessageHandler metadata', async () => {
    const registry = buildRegistry([{ instance: new OrdersHandlerProvider() }]);

    registry.onModuleInit();

    const handlers = registry.findHandlers('svc.orders', 'OrderCreated');
    expect(handlers).toHaveLength(2);
    await expect(handlers[0](undefined as never)).resolves.toBe(
      'orders-instance',
    );
  });

  it('skips providers without an instance without throwing', () => {
    const registry = buildRegistry([
      { instance: undefined },
      { instance: new OrdersHandlerProvider() },
    ]);

    expect(() => registry.onModuleInit()).not.toThrow();
    expect(registry.findHandlers('svc.orders', 'OrderCreated')).toHaveLength(2);
  });

  it('logs a discovery count of zero and stays empty when no handlers are declared', () => {
    const registry = buildRegistry([{ instance: new UndecoratedProvider() }]);
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    registry.onModuleInit();

    expect(registry.findHandlers('anything')).toEqual([]);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('0'));

    logSpy.mockRestore();
  });

  it('matches a catch-all handler (no eventType) regardless of the message event-type', async () => {
    const registry = buildRegistry([{ instance: new OrdersHandlerProvider() }]);
    registry.onModuleInit();

    const handlers = registry.findHandlers('svc.orders', 'SomeUnrelatedType');

    expect(handlers).toHaveLength(1);
    await expect(handlers[0](undefined as never)).resolves.toBe(
      'orders-instance',
    );
  });

  it('returns an empty list for an unknown topic', () => {
    const registry = buildRegistry([{ instance: new OrdersHandlerProvider() }]);
    registry.onModuleInit();

    expect(registry.findHandlers('svc.unknown-topic')).toEqual([]);
  });
});
