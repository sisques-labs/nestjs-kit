import { IInboundConsumerOptions } from './domain/interfaces/inbound-consumer-options.interface';

export interface IMessagingModuleOptions {
  /**
   * `aggregateRootType -> bounded-context module` map (the Kafka topic
   * suffix). Inherently app-specific — it mirrors that app's own bounded
   * context folder layout (each context's domain/aggregates directory) — so
   * each app generates and owns this map itself (see the
   * `generate-aggregate-module-map` pattern) and passes it in here rather
   * than this package trying to derive it from a filesystem it can't see.
   */
  aggregateModuleMap: Readonly<Record<string, string>>;

  /**
   * Optional declarative inbound Kafka consumers. When present, the kit
   * starts one consumer per entry (`IEventConsumer.run(groupId, topics, ...)`)
   * at `onApplicationBootstrap` and routes messages to every provider method
   * decorated with `@KafkaMessageHandler` whose `topic`/`eventType` match.
   * Omitting this option preserves current behavior — no consumer auto-starts.
   *
   * Consumer-group shutdown only runs cleanly on SIGTERM/SIGINT if the host
   * app calls `app.enableShutdownHooks()` in `main.ts` — this is a
   * host-application responsibility the kit cannot enable itself.
   */
  inboundConsumers?: readonly IInboundConsumerOptions[];
}
