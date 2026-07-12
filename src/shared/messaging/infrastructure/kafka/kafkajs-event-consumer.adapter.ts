import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, IHeaders, Kafka, SASLOptions } from 'kafkajs';

import {
  IEventConsumer,
  InboundMessageHandler,
} from '../../domain/ports/event-consumer.port';
import { IKafkaConfig } from './kafka-config.interface';

/**
 * Consumes messages from Kafka via kafkajs. One `Consumer` (one consumer
 * group) is created per `run()` call, so an app can subscribe several
 * independent groups to different topic sets from the same adapter instance.
 *
 * A handler failure is logged and swallowed so the consumer keeps running —
 * offsets still auto-commit on the default kafkajs `eachMessage` behavior,
 * consistent with the best-effort delivery already documented for this
 * system's producer side.
 *
 * When `KAFKA_ENABLED` is false no Kafka client is created and `run()` is a
 * no-op (handler is never invoked), so the app boots without a broker.
 *
 * Reads its config from `ConfigService.getOrThrow<IKafkaConfig>('kafka')` —
 * same namespace as `KafkajsEventPublisherAdapter`.
 */
@Injectable()
export class KafkajsEventConsumerAdapter
  implements IEventConsumer, OnModuleDestroy
{
  private readonly logger = new Logger(KafkajsEventConsumerAdapter.name);
  private readonly config: IKafkaConfig;
  private readonly kafka: Kafka | null;
  private readonly consumers: Consumer[] = [];

  constructor(configService: ConfigService) {
    this.config = configService.getOrThrow<IKafkaConfig>('kafka');
    this.kafka = this.config.enabled ? this.createClient() : null;
  }

  private createClient(): Kafka {
    return new Kafka({
      clientId: this.config.clientId,
      brokers: this.config.brokers,
      ssl: this.config.ssl,
      ...(this.config.sasl ? { sasl: this.config.sasl as SASLOptions } : {}),
    });
  }

  async run(
    groupId: string,
    topics: string[],
    handler: InboundMessageHandler,
  ): Promise<void> {
    if (!this.kafka) {
      return;
    }
    const consumer = this.kafka.consumer({ groupId });
    this.consumers.push(consumer);

    await consumer.connect();
    await consumer.subscribe({ topics, fromBeginning: false });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          await handler({
            topic,
            partition,
            key: message.key?.toString() ?? null,
            headers: this.decodeHeaders(message.headers),
            value: message.value?.toString() ?? null,
          });
        } catch (error) {
          this.logger.error(
            `Handler failed for message on "${topic}" (partition=${partition}, offset=${message.offset}, group=${groupId}): ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      },
    });
    this.logger.log(
      `Kafka consumer "${groupId}" subscribed to [${topics.join(', ')}]`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(
      this.consumers.map(async (consumer) => {
        try {
          await consumer.disconnect();
        } catch (error) {
          this.logger.warn(
            `Kafka consumer failed to disconnect cleanly: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }),
    );
  }

  private decodeHeaders(headers?: IHeaders): Record<string, string> {
    if (!headers) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [
        key,
        Array.isArray(value)
          ? (value[0]?.toString() ?? '')
          : (value?.toString() ?? ''),
      ]),
    );
  }
}
