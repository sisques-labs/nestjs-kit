import { IInboundMessage } from '../interfaces/inbound-message.interface';

export const EVENT_CONSUMER = Symbol('EVENT_CONSUMER');

export type InboundMessageHandler = (message: IInboundMessage) => Promise<void>;

/**
 * Port for consuming messages from an external message broker. Implemented in
 * infrastructure (Kafka via kafkajs, or a no-op when consuming is disabled).
 *
 * Unlike `IEventPublisher`, this package does not own any in-process routing
 * for inbound messages (there is no symmetric "InboundEventBus") — the
 * consuming app calls `run()` directly with its own topic list and handler,
 * and owns parsing/validating the message body and dispatching to its own
 * CommandBus/QueryBus.
 */
export interface IEventConsumer {
  /**
   * Subscribes to `topics` under `groupId` and invokes `handler` for every
   * message. Resolves once the consumer is running; kafkajs delivers messages
   * to `handler` asynchronously from then on.
   *
   * A handler that throws is logged and swallowed — one malformed/failing
   * message never stops the consumer (mirrors the publisher's best-effort
   * philosophy). Call `run()` once per distinct `groupId`.
   */
  run(
    groupId: string,
    topics: string[],
    handler: InboundMessageHandler,
  ): Promise<void>;
}
