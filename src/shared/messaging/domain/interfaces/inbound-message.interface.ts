/**
 * A raw Kafka message delivered to an `IEventConsumer` handler. Headers are
 * decoded to strings; `value` is the raw message body — the handler owns
 * parsing/validating it (this package has no opinion on envelope shape for
 * inbound messages, unlike the outbound `IOutboundEvent` envelope).
 */
export interface IInboundMessage {
  topic: string;
  partition: number;
  key: string | null;
  headers: Record<string, string>;
  value: string | null;
}
