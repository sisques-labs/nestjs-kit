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
}
