import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jsonEvent, KurrentDBClient } from '@kurrent/kurrentdb-client';

import { IOutboundEvent } from '../../../messaging/domain/interfaces/outbound-event.interface';
import { IEventStoreWriter } from '../../domain/ports/event-store-writer.port';
import { IEventStoreConfig } from './event-store-config.interface';

/**
 * Appends outbound domain events to KurrentDB (EventStoreDB) via the official
 * gRPC client.
 *
 * - Stream: `${streamPrefix}-${aggregateRootType}-${aggregateRootId}` — one
 *   stream per aggregate instance, the idiomatic ESDB layout.
 * - Event type: `event.action` (kebab-cased, e.g. `plant-updated`) — the
 *   field ESDB projections typically key off.
 * - Everything else (eventType class name, aggregate/entity ids, schema
 *   version, occurredAt, correlation/causation ids) travels in event
 *   metadata; `event.data` is the JSON body.
 *
 * The client is a singleton connection that dials lazily on first use, so
 * creating it never fails at boot even without a reachable instance.
 *
 * When `EVENTSTORE_ENABLED` is false the client is never created and every
 * method is a no-op, so the app boots without an instance (the forwarder
 * also never subscribes).
 *
 * Reads its config from `ConfigService.getOrThrow<IEventStoreConfig>('eventStore')`
 * — the consuming app registers a config factory under that namespace.
 */
@Injectable()
export class KurrentDbEventWriterAdapter
  implements IEventStoreWriter, OnModuleDestroy
{
  private readonly logger = new Logger(KurrentDbEventWriterAdapter.name);
  private readonly config: IEventStoreConfig;
  private readonly client: KurrentDBClient | null;

  constructor(configService: ConfigService) {
    this.config = configService.getOrThrow<IEventStoreConfig>('eventStore');
    this.client = this.config.enabled
      ? KurrentDBClient.connectionString(this.config.connectionString)
      : null;
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.client) {
      return;
    }
    try {
      await this.client.dispose();
    } catch (error) {
      this.logger.warn(
        `KurrentDB client failed to dispose cleanly: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async append(event: IOutboundEvent): Promise<void> {
    if (!this.client) {
      return;
    }
    const stream = `${this.config.streamPrefix}-${event.aggregateRootType}-${event.aggregateRootId}`;
    await this.client.appendToStream(
      stream,
      jsonEvent({
        id: event.eventId,
        type: event.action,
        data: event.data as Record<string, unknown>,
        metadata: this.buildMetadata(event),
      }),
    );
    this.logger.debug(`Appended "${event.action}" to "${stream}"`);
  }

  private buildMetadata(event: IOutboundEvent): Record<string, unknown> {
    return {
      eventType: event.eventType,
      aggregateRootType: event.aggregateRootType,
      entityId: event.entityId,
      entityType: event.entityType,
      schemaVersion: event.schemaVersion,
      occurredAt: event.occurredAt.toISOString(),
      correlationId: event.correlationId,
      causationId: event.causationId,
    };
  }
}
