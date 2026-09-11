/**
 * Routing options for an `@KafkaMessageHandler`-decorated method.
 *
 * A handler matches an inbound message when its `topic` equals the message's
 * topic AND (`eventType` is omitted, matching any `event-type` header — a
 * catch-all — OR `eventType` equals the message's `event-type` header).
 */
export interface IKafkaMessageHandlerOptions {
  /** Kafka topic this handler subscribes to. */
  topic: string;
  /** Matched against the `event-type` header; omit for a topic catch-all. */
  eventType?: string;
}
