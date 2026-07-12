// ─── Messaging (Kafka domain-event forwarding) ─────────────────────────────────
// Separate entry point so importing '@sisques-labs/nestjs-kit' does not
// require the optional `kafkajs` and `@nestjs/config` peer dependencies.
// Import from '@sisques-labs/nestjs-kit/messaging' when you forward domain
// events to Kafka. Not to be confused with '/kafka', which is the Confluent
// schema-registry integration — a separate, unrelated concern.

export * from '../shared/messaging/domain/constants/messaging.constants';
export * from '../shared/messaging/domain/interfaces/inbound-message.interface';
export * from '../shared/messaging/domain/interfaces/outbound-event.interface';
export * from '../shared/messaging/domain/ports/event-consumer.port';
export * from '../shared/messaging/domain/ports/event-publisher.port';
export * from '../shared/messaging/domain/routing/event-routing.service';

export * from '../shared/messaging/application/services/domain-event-forwarder.service';

export * from '../shared/messaging/infrastructure/kafka/kafka-config.interface';
export * from '../shared/messaging/infrastructure/kafka/kafkajs-event-consumer.adapter';
export * from '../shared/messaging/infrastructure/kafka/kafkajs-event-publisher.adapter';

export * from '../shared/messaging/messaging-module-options.interface';
export * from '../shared/messaging/messaging.module';
