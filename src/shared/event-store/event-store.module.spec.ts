import { EVENT_STORE_WRITER } from './domain/ports/event-store-writer.port';
import { EventStoreModule } from './event-store.module';

describe('EventStoreModule.forRoot', () => {
  const dynamicModule = EventStoreModule.forRoot();

  it('registers itself as a global module', () => {
    expect(dynamicModule.global).toBe(true);
  });

  it('exports EVENT_STORE_WRITER so any module can inject it without importing EventStoreModule directly', () => {
    expect(dynamicModule.exports).toContain(EVENT_STORE_WRITER);
  });
});
