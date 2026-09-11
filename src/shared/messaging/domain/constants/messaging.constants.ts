/**
 * DI token for the app-supplied `aggregateRootType -> module` map (see
 * `IMessagingModuleOptions.aggregateModuleMap`). The map is inherently
 * app-specific — it mirrors that app's own bounded-context folder layout —
 * so it's injected rather than baked into this package.
 */
export const AGGREGATE_MODULE_MAP = Symbol('AGGREGATE_MODULE_MAP');

/** Module used when an aggregate root type has no explicit mapping. */
export const UNMAPPED_MODULE = 'unmapped';

/**
 * Metadata key used to flag a provider method as an inbound Kafka message
 * handler. Methods tagged with the {@link KafkaMessageHandler} decorator are
 * discovered at bootstrap by `InboundHandlerRegistry` via NestJS
 * `DiscoveryService`/`MetadataScanner` and indexed for routing.
 */
export const KAFKA_MESSAGE_HANDLER_METADATA = Symbol(
  'messaging:kafka-message-handler',
);

/** DI token for the app-supplied `IInboundConsumerOptions[]` (see `IMessagingModuleOptions.inboundConsumers`). */
export const INBOUND_CONSUMERS = Symbol('INBOUND_CONSUMERS');

/**
 * Kafka message header carrying the event/action name for inbound routing
 * (written by `KafkajsEventPublisherAdapter.buildHeaders` on the outbound
 * side). Never used to parse or inspect the message `value`.
 */
export const EVENT_TYPE_HEADER = 'event-type';
