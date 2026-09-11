import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import {
  EVENT_TYPE_HEADER,
  INBOUND_CONSUMERS,
} from '../../domain/constants/messaging.constants';
import { IInboundConsumerOptions } from '../../domain/interfaces/inbound-consumer-options.interface';
import { IInboundMessage } from '../../domain/interfaces/inbound-message.interface';
import {
  EVENT_CONSUMER,
  IEventConsumer,
} from '../../domain/ports/event-consumer.port';
import { IInboundErrorHandler } from '../../domain/ports/inbound-error-handler.port';
import { InboundHandlerRegistry } from './inbound-handler-registry.service';

/**
 * Starts one Kafka consumer per declared `inboundConsumers` entry at
 * `onApplicationBootstrap` (guaranteed to run after every `onModuleInit`, so
 * `InboundHandlerRegistry` is already populated) and routes each inbound
 * message to matching handlers via `InboundHandlerRegistry.findHandlers()`.
 *
 * Every configured `errorHandler` is resolved once via
 * `ModuleRef.get(..., { strict: false })` before any consumer starts — a
 * class that is not registered as a provider anywhere in the app throws at
 * bootstrap, not on the first failing message.
 *
 * `onModuleDestroy` only flags `isShuttingDown` so no new dispatch starts;
 * the actual Kafka disconnect/group-leave stays owned by
 * `KafkajsEventConsumerAdapter`'s own `onModuleDestroy`. Per NestJS,
 * `OnModuleDestroy` only runs on SIGTERM/SIGINT when the host app calls
 * `app.enableShutdownHooks()` — the kit warns about this at bootstrap but
 * cannot enable it itself.
 */
@Injectable()
export class InboundConsumerBootstrapService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(InboundConsumerBootstrapService.name);
  private readonly resolvedErrorHandlers = new Map<
    string,
    IInboundErrorHandler
  >();
  private isShuttingDown = false;

  constructor(
    @Inject(INBOUND_CONSUMERS)
    private readonly inboundConsumers: readonly IInboundConsumerOptions[],
    @Inject(EVENT_CONSUMER)
    private readonly eventConsumer: IEventConsumer,
    private readonly registry: InboundHandlerRegistry,
    private readonly moduleRef: ModuleRef,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.inboundConsumers.length) {
      return;
    }

    for (const consumer of this.inboundConsumers) {
      if (consumer.errorHandler) {
        this.resolvedErrorHandlers.set(
          consumer.groupId,
          this.moduleRef.get<IInboundErrorHandler>(consumer.errorHandler, {
            strict: false,
          }),
        );
      }
    }

    this.logger.warn(
      'Inbound Kafka consumers are configured. Call app.enableShutdownHooks() ' +
        'in main.ts so OnModuleDestroy runs on SIGTERM/SIGINT and consumer ' +
        'groups leave cleanly — this is a host-application responsibility.',
    );

    await Promise.all(
      this.inboundConsumers.map((consumer) =>
        this.eventConsumer.run(consumer.groupId, consumer.topics, (message) =>
          this.dispatch(consumer, message),
        ),
      ),
    );
  }

  onModuleDestroy(): void {
    this.isShuttingDown = true;
  }

  private async dispatch(
    consumer: IInboundConsumerOptions,
    message: IInboundMessage,
  ): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    const eventType = message.headers[EVENT_TYPE_HEADER];
    const handlers = this.registry.findHandlers(message.topic, eventType);

    if (!handlers.length) {
      this.logger.log(
        `No inbound handler matched topic "${message.topic}"${
          eventType ? ` (event-type=${eventType})` : ''
        } (group=${consumer.groupId}); message dropped`,
      );
      return;
    }

    for (const handler of handlers) {
      try {
        await handler(message);
      } catch (error) {
        await this.handleError(consumer, message, error);
      }
    }
  }

  private async handleError(
    consumer: IInboundConsumerOptions,
    message: IInboundMessage,
    error: unknown,
  ): Promise<void> {
    const errorHandler = this.resolvedErrorHandlers.get(consumer.groupId);

    if (!errorHandler) {
      this.logger.error(
        `Handler failed for message on "${message.topic}" (group=${consumer.groupId}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return;
    }

    try {
      await errorHandler.onHandlerError({
        message,
        error,
        groupId: consumer.groupId,
        topic: message.topic,
      });
    } catch (handlerError) {
      this.logger.error(
        `Inbound error handler failed for message on "${message.topic}" (group=${consumer.groupId}): ${
          handlerError instanceof Error
            ? handlerError.message
            : String(handlerError)
        }`,
      );
    }
  }
}
