import * as EventStoreEntrypoint from './event-store';

describe('entrypoints/event-store barrel', () => {
  it('re-exports the port, forwarder, adapter, config interface and module', () => {
    expect(EventStoreEntrypoint.EVENT_STORE_WRITER).toBeDefined();
    expect(EventStoreEntrypoint.EventStoreForwarderService).toBeDefined();
    expect(EventStoreEntrypoint.KurrentDbEventWriterAdapter).toBeDefined();
    expect(EventStoreEntrypoint.EventStoreModule).toBeDefined();
  });
});
