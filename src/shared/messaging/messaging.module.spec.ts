import { AGGREGATE_MODULE_MAP } from './domain/constants/messaging.constants';
import { EVENT_CONSUMER } from './domain/ports/event-consumer.port';
import { EVENT_PUBLISHER } from './domain/ports/event-publisher.port';
import { MessagingModule } from './messaging.module';

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
