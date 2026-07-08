// ─── Kafka / Schema Registry ───────────────────────────────────────────────────
// Separate entry point so importing '@sisques-labs/nestjs-kit' does not
// require the optional `@kafkajs/confluent-schema-registry` and `@nestjs/axios`
// peer dependencies. Import from '@sisques-labs/nestjs-kit/kafka' when you use
// Kafka event publishing or the Confluent schema registry.

export * from '../shared/infrastructure/kafka/interfaces/kafka-event-publisher.interface';
export * from '../shared/infrastructure/kafka/schema-registry/schema-registry-options.interface';
export * from '../shared/infrastructure/kafka/schema-registry/schema-registry.module';
export * from '../shared/infrastructure/kafka/schema-registry/schema-registry.service';
