import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

import { KAFKA_MESSAGE_HANDLER_METADATA } from '../../domain/constants/messaging.constants';
import { IKafkaMessageHandlerOptions } from '../../domain/interfaces/kafka-message-handler-options.interface';
import { IInboundMessage } from '../../domain/interfaces/inbound-message.interface';

export type InboundHandlerMethod = (
  message: IInboundMessage,
) => Promise<void> | void;

interface IRegisteredHandler {
  topic: string;
  eventType?: string;
  handler: InboundHandlerMethod;
}

/**
 * Collects every provider method tagged with the {@link KafkaMessageHandler}
 * decorator across all app modules and indexes them by `topic`/`eventType`
 * for routing by `InboundConsumerBootstrapService`.
 *
 * Discovery happens once at bootstrap (`onModuleInit`) using NestJS
 * `DiscoveryService` + `MetadataScanner` (the decorator is method-level,
 * unlike `McpTool`, so every provider's own method names must be scanned),
 * so message dispatch pays no scan cost.
 */
@Injectable()
export class InboundHandlerRegistry implements OnModuleInit {
  private readonly logger = new Logger(InboundHandlerRegistry.name);
  private readonly handlers: IRegisteredHandler[] = [];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit(): void {
    for (const wrapper of this.discoveryService.getProviders()) {
      const instance = wrapper.instance as object | undefined;
      if (!instance || typeof instance !== 'object') {
        continue;
      }

      this.registerHandlersFrom(instance);
    }

    this.logger.log(
      `Discovered ${this.handlers.length} inbound Kafka message handlers`,
    );
  }

  findHandlers(topic: string, eventType?: string): InboundHandlerMethod[] {
    return this.handlers
      .filter(
        (entry) =>
          entry.topic === topic &&
          (entry.eventType === undefined || entry.eventType === eventType),
      )
      .map((entry) => entry.handler);
  }

  private registerHandlersFrom(instance: object): void {
    const prototype = Object.getPrototypeOf(instance) as object | null;
    if (!prototype) {
      return;
    }

    const methodNames = this.metadataScanner.getAllMethodNames(prototype);
    const instanceRecord = instance as Record<string, InboundHandlerMethod>;

    for (const methodName of methodNames) {
      const method = instanceRecord[methodName];
      if (typeof method !== 'function') {
        continue;
      }

      const options = this.reflector.get<
        IKafkaMessageHandlerOptions | undefined
      >(KAFKA_MESSAGE_HANDLER_METADATA, method);

      if (!options) {
        continue;
      }

      this.handlers.push({
        topic: options.topic,
        eventType: options.eventType,
        handler: method.bind(instance),
      });
    }
  }
}
