import { SetMetadata } from '@nestjs/common';

import { KAFKA_MESSAGE_HANDLER_METADATA } from '../constants/messaging.constants';
import { IKafkaMessageHandlerOptions } from '../interfaces/kafka-message-handler-options.interface';

/**
 * Marks a provider method as an inbound Kafka message handler.
 *
 * The class must still be registered as a provider (this decorator does not
 * register anything by itself). At bootstrap, `InboundHandlerRegistry`
 * discovers every provider method carrying this metadata and indexes it by
 * `topic`/`eventType` for routing by `InboundConsumerBootstrapService`.
 *
 * Calling the decorated method directly is unaffected — the decorator only
 * attaches metadata, it does not wrap or replace the method.
 */
export const KafkaMessageHandler = (
  options: IKafkaMessageHandlerOptions,
): MethodDecorator => SetMetadata(KAFKA_MESSAGE_HANDLER_METADATA, options);
