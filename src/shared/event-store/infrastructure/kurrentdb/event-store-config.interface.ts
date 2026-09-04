/**
 * Shape of the KurrentDB (EventStoreDB) connection config the
 * `KurrentDbEventWriterAdapter` expects at the `'eventStore'` `ConfigService`
 * namespace. The app registers this itself (reading `EVENTSTORE_*` env vars —
 * the app-specific default stream prefix belongs there, not in this
 * package), typed against this interface so the shape never drifts.
 */
export interface IEventStoreConfig {
  /** Forwarding is opt-in — the adapter is a no-op and never connects when `false`. */
  enabled: boolean;
  /** Full KurrentDB connection string, e.g. `kurrentdb://localhost:2113?tls=false`. */
  connectionString: string;
  /** Stream prefix — streams are `${streamPrefix}-${aggregateRootType}-${aggregateRootId}`. */
  streamPrefix: string;
}
