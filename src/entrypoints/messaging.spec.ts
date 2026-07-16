import * as MessagingEntrypoint from './messaging';

describe('entrypoints/messaging barrel', () => {
  it('re-exports messaging constants, ports, services, adapters and module', () => {
    expect(MessagingEntrypoint.AGGREGATE_MODULE_MAP).toBeDefined();
    expect(MessagingEntrypoint.EVENT_CONSUMER).toBeDefined();
    expect(MessagingEntrypoint.EVENT_PUBLISHER).toBeDefined();
    expect(MessagingEntrypoint.EventRoutingService).toBeDefined();
    expect(MessagingEntrypoint.DomainEventForwarderService).toBeDefined();
    expect(MessagingEntrypoint.KafkajsEventConsumerAdapter).toBeDefined();
    expect(MessagingEntrypoint.KafkajsEventPublisherAdapter).toBeDefined();
    expect(MessagingEntrypoint.MessagingModule).toBeDefined();
  });
});
