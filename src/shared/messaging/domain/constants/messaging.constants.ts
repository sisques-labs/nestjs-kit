/**
 * DI token for the app-supplied `aggregateRootType -> module` map (see
 * `IMessagingModuleOptions.aggregateModuleMap`). The map is inherently
 * app-specific — it mirrors that app's own bounded-context folder layout —
 * so it's injected rather than baked into this package.
 */
export const AGGREGATE_MODULE_MAP = Symbol('AGGREGATE_MODULE_MAP');

/** Module used when an aggregate root type has no explicit mapping. */
export const UNMAPPED_MODULE = 'unmapped';
