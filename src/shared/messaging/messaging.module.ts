import { DynamicModule, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { DomainEventForwarderService } from './application/services/domain-event-forwarder.service';
import { AGGREGATE_MODULE_MAP } from './domain/constants/messaging.constants';
import { EVENT_CONSUMER } from './domain/ports/event-consumer.port';
import { EVENT_PUBLISHER } from './domain/ports/event-publisher.port';
import { EventRoutingService } from './domain/routing/event-routing.service';
import { KafkajsEventConsumerAdapter } from './infrastructure/kafka/kafkajs-event-consumer.adapter';
import { KafkajsEventPublisherAdapter } from './infrastructure/kafka/kafkajs-event-publisher.adapter';
import { IMessagingModuleOptions } from './messaging-module-options.interface';

/**
 * Bridges the in-process `@nestjs/cqrs` `EventBus` to Kafka. `DomainEventForwarderService`
 * subscribes to every published domain event and republishes it through the
 * `EVENT_PUBLISHER` port, in addition to in-process delivery.
 *
 * Forwarding is opt-in via `KAFKA_ENABLED` (the adapter is a no-op and never opens a
 * connection when disabled), so no broker is required to boot locally or in tests.
 * Topics are `${KAFKA_TOPIC_PREFIX}.${module}` (e.g. `my-service.plants`); the
 * action lives in the `event-type` header.
 *
 * Expects the app to have already registered a `'kafka'` config namespace
 * shaped like `IKafkaConfig` (via `ConfigModule.forRoot({ load: [...] })`) —
 * see `infrastructure/kafka/kafka-config.interface.ts`.
 *
 * Also registers `EVENT_CONSUMER` (`KafkajsEventConsumerAdapter`), the inbound
 * counterpart: the consuming app injects it directly and calls `run(groupId,
 * topics, handler)` from its own bootstrap service to subscribe and dispatch
 * to its own CommandBus/QueryBus — this package has no opinion on inbound
 * envelope shape or routing (see `IEventConsumer`).
 *
 * @example
 * ```ts
 * MessagingModule.forRoot({ aggregateModuleMap: AGGREGATE_MODULE_MAP })
 * ```
 */
@Module({})
export class MessagingModule {
  static forRoot(options: IMessagingModuleOptions): DynamicModule {
    return {
      module: MessagingModule,
      imports: [CqrsModule],
      providers: [
        { provide: AGGREGATE_MODULE_MAP, useValue: options.aggregateModuleMap },
        EventRoutingService,
        DomainEventForwarderService,
        { provide: EVENT_PUBLISHER, useClass: KafkajsEventPublisherAdapter },
        { provide: EVENT_CONSUMER, useClass: KafkajsEventConsumerAdapter },
      ],
    };
  }
}
