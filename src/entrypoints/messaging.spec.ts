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

  it('re-exports the new declarative inbound-consumer symbols additively', () => {
    expect(MessagingEntrypoint.KAFKA_MESSAGE_HANDLER_METADATA).toBeDefined();
    expect(MessagingEntrypoint.INBOUND_CONSUMERS).toBeDefined();
    expect(MessagingEntrypoint.EVENT_TYPE_HEADER).toBeDefined();
    expect(MessagingEntrypoint.KafkaMessageHandler).toBeDefined();
    expect(MessagingEntrypoint.InboundHandlerRegistry).toBeDefined();
    expect(MessagingEntrypoint.InboundConsumerBootstrapService).toBeDefined();
  });

  it('still resolves every prior export to its original signature', () => {
    expect(typeof MessagingEntrypoint.KafkajsEventConsumerAdapter).toBe(
      'function',
    );
    expect(typeof MessagingEntrypoint.KafkajsEventPublisherAdapter).toBe(
      'function',
    );
    expect(typeof MessagingEntrypoint.MessagingModule).toBe('function');
    expect(typeof MessagingEntrypoint.MessagingModule.forRoot).toBe('function');
    expect(typeof MessagingEntrypoint.DomainEventForwarderService).toBe(
      'function',
    );
    expect(typeof MessagingEntrypoint.EventRoutingService).toBe('function');
  });
});
