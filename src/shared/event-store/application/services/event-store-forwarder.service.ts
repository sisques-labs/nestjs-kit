import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventBus, IEvent } from '@nestjs/cqrs';
import { Subscription } from 'rxjs';

import { deriveAction } from '../../../messaging/domain/routing/event-routing.service';
import { IOutboundEvent } from '../../../messaging/domain/interfaces/outbound-event.interface';
import { IEventStoreConfig } from '../../infrastructure/kurrentdb/event-store-config.interface';
import {
  EVENT_STORE_WRITER,
  IEventStoreWriter,
} from '../../domain/ports/event-store-writer.port';

/** Structural shape of a `BaseEvent` (nestjs-kit) — the fields the forwarder reads. */
interface DomainEventLike {
  eventId: string;
  eventType: string;
  aggregateRootId: string;
  aggregateRootType: string;
  ocurredAt: Date;
  entityId: string;
  entityType: string;
  schemaVersion: string;
  correlationId: string | null;
  causationId: string | null;
  data: unknown;
}

function isDomainEvent(event: IEvent): event is IEvent & DomainEventLike {
  const candidate = event as Partial<DomainEventLike>;
  return (
    typeof candidate.eventId === 'string' &&
    typeof candidate.eventType === 'string' &&
    typeof candidate.aggregateRootId === 'string' &&
    typeof candidate.aggregateRootType === 'string'
  );
}

/**
 * Appends every domain event published on the in-process `@nestjs/cqrs`
 * `EventBus` to KurrentDB, in addition to in-process delivery and any Kafka
 * forwarding. It subscribes to the shared `EventBus` stream independently —
 * **no command handler or aggregate is edited**, mirroring
 * `DomainEventForwarderService` (Kafka).
 *
 * Appending is best-effort: a failure is logged and swallowed so the command
 * flow is never affected. When `EVENTSTORE_ENABLED` is false the forwarder
 * does not subscribe at all (zero overhead).
 */
@Injectable()
export class EventStoreForwarderService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(EventStoreForwarderService.name);
  private subscription?: Subscription;

  constructor(
    private readonly eventBus: EventBus,
    private readonly configService: ConfigService,
    @Inject(EVENT_STORE_WRITER)
    private readonly writer: IEventStoreWriter,
  ) {}

  onModuleInit(): void {
    const enabled =
      this.configService.get<IEventStoreConfig>('eventStore')?.enabled ?? false;
    if (!enabled) {
      this.logger.log(
        'EventStore forwarding disabled (EVENTSTORE_ENABLED!=true) — not subscribing',
      );
      return;
    }

    this.subscription = this.eventBus.subscribe((event: IEvent) => {
      void this.forward(event);
    });
    this.logger.log('EventStore forwarding enabled — subscribed to EventBus');
  }

  onModuleDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private async forward(event: IEvent): Promise<void> {
    if (!isDomainEvent(event)) {
      return;
    }

    const outbound = this.toOutboundEvent(event);

    try {
      await this.writer.append(outbound);
    } catch (error) {
      this.logger.error(
        `Failed to append "${outbound.eventType}" (${outbound.eventId}) to the event store: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private toOutboundEvent(event: DomainEventLike): IOutboundEvent {
    return {
      module: event.aggregateRootType,
      action: deriveAction(event.eventType),
      eventType: event.eventType,
      eventId: event.eventId,
      aggregateRootId: event.aggregateRootId,
      aggregateRootType: event.aggregateRootType,
      entityId: event.entityId,
      entityType: event.entityType,
      schemaVersion: event.schemaVersion,
      occurredAt: event.ocurredAt,
      correlationId: event.correlationId,
      causationId: event.causationId,
      data: event.data,
    };
  }
}
