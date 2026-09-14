import { DynamicModule, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { EventStoreForwarderService } from './application/services/event-store-forwarder.service';
import { EVENT_STORE_WRITER } from './domain/ports/event-store-writer.port';
import { KurrentDbEventWriterAdapter } from './infrastructure/kurrentdb/kurrentdb-event-writer.adapter';

/**
 * Bridges the in-process `@nestjs/cqrs` `EventBus` to KurrentDB (EventStoreDB).
 * `EventStoreForwarderService` subscribes to every published domain event and
 * appends it to a per-aggregate stream through the `EVENT_STORE_WRITER` port,
 * in addition to in-process delivery and any Kafka forwarding — independent
 * modules, so either can be enabled without the other.
 *
 * Forwarding is opt-in via `EVENTSTORE_ENABLED` (the adapter is a no-op and
 * never opens a connection when disabled), so no instance is required to boot
 * locally or in tests. Streams are `${streamPrefix}-${aggregateRootType}-${aggregateRootId}`
 * (e.g. `my-service-PlantAggregate-<id>`) — one stream per aggregate instance.
 *
 * Expects the app to have already registered an `'eventStore'` config
 * namespace shaped like `IEventStoreConfig` (via `ConfigModule.forRoot({
 * load: [...] })`) — see `infrastructure/kurrentdb/event-store-config.interface.ts`.
 *
 * Registered as a **global** module (like `MessagingModule`): call
 * `forRoot()` once, typically from the app's core/shared module, and
 * `EVENT_STORE_WRITER` becomes injectable from any module in the app.
 *
 * @example
 * ```ts
 * EventStoreModule.forRoot()
 * ```
 */
@Module({})
export class EventStoreModule {
  static forRoot(): DynamicModule {
    return {
      module: EventStoreModule,
      global: true,
      imports: [CqrsModule],
      providers: [
        EventStoreForwarderService,
        { provide: EVENT_STORE_WRITER, useClass: KurrentDbEventWriterAdapter },
      ],
      exports: [EVENT_STORE_WRITER],
    };
  }
}
