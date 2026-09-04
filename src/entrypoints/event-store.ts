// ─── Event Store (KurrentDB domain-event forwarding) ───────────────────────────
// Separate entry point so importing '@sisques-labs/nestjs-kit' does not
// require the optional `@kurrent/kurrentdb-client` and `@nestjs/config` peer
// dependencies. Import from '@sisques-labs/nestjs-kit/event-store' when you
// forward domain events to KurrentDB (EventStoreDB) — independent of, and
// composable with, '/messaging' (Kafka).

export * from '../shared/event-store/domain/ports/event-store-writer.port';

export * from '../shared/event-store/application/services/event-store-forwarder.service';

export * from '../shared/event-store/infrastructure/kurrentdb/event-store-config.interface';
export * from '../shared/event-store/infrastructure/kurrentdb/kurrentdb-event-writer.adapter';

export * from '../shared/event-store/event-store.module';
