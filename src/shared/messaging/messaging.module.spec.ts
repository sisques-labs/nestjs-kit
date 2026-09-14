import { DynamicModule } from '@nestjs/common';

import { InboundConsumerBootstrapService } from './application/services/inbound-consumer-bootstrap.service';
import { InboundHandlerRegistry } from './application/services/inbound-handler-registry.service';
import {
  AGGREGATE_MODULE_MAP,
  INBOUND_CONSUMERS,
} from './domain/constants/messaging.constants';
import { EVENT_CONSUMER } from './domain/ports/event-consumer.port';
import { EVENT_PUBLISHER } from './domain/ports/event-publisher.port';
import { MessagingModule } from './messaging.module';

function findProviderToken(
  providers: DynamicModule['providers'],
  token: unknown,
): boolean {
  return !!providers?.some(
    (provider) =>
      provider === token ||
      (typeof provider === 'object' &&
        provider !== null &&
        'provide' in provider &&
        provider.provide === token),
  );
}

describe('MessagingModule.forRoot', () => {
  const dynamicModule = MessagingModule.forRoot({ aggregateModuleMap: {} });

  it('registers itself as a global module', () => {
    expect(dynamicModule.global).toBe(true);
  });

  it('exports EVENT_PUBLISHER and EVENT_CONSUMER so any module can inject them without importing MessagingModule directly', () => {
    expect(dynamicModule.exports).toContain(EVENT_PUBLISHER);
    expect(dynamicModule.exports).toContain(EVENT_CONSUMER);
  });

  it('still provides AGGREGATE_MODULE_MAP for the in-module forwarder', () => {
    const provider = dynamicModule.providers?.find(
      (p) =>
        typeof p === 'object' &&
        'provide' in p &&
        p.provide === AGGREGATE_MODULE_MAP,
    );
    expect(provider).toBeDefined();
  });
});

describe('MessagingModule.forRoot without inboundConsumers', () => {
  const dynamicModule = MessagingModule.forRoot({ aggregateModuleMap: {} });

  it('does not register inbound-consumer providers', () => {
    expect(findProviderToken(dynamicModule.providers, INBOUND_CONSUMERS)).toBe(
      false,
    );
    expect(dynamicModule.providers).not.toContain(InboundHandlerRegistry);
    expect(dynamicModule.providers).not.toContain(
      InboundConsumerBootstrapService,
    );
  });

  it('still exports EVENT_CONSUMER unchanged', () => {
    expect(dynamicModule.exports).toEqual([EVENT_PUBLISHER, EVENT_CONSUMER]);
  });
});

describe('MessagingModule.forRoot with inboundConsumers', () => {
  const dynamicModule = MessagingModule.forRoot({
    aggregateModuleMap: {},
    inboundConsumers: [{ groupId: 'orders', topics: ['svc.orders'] }],
  });

  it('registers INBOUND_CONSUMERS, InboundHandlerRegistry, and InboundConsumerBootstrapService', () => {
    expect(findProviderToken(dynamicModule.providers, INBOUND_CONSUMERS)).toBe(
      true,
    );
    expect(dynamicModule.providers).toContain(InboundHandlerRegistry);
    expect(dynamicModule.providers).toContain(InboundConsumerBootstrapService);
  });

  it('does not change the exports array', () => {
    expect(dynamicModule.exports).toEqual([EVENT_PUBLISHER, EVENT_CONSUMER]);
  });
});
