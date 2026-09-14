import { IInboundMessage } from '../interfaces/inbound-message.interface';

/**
 * Context passed to {@link IInboundErrorHandler.onHandlerError} when a matched
 * inbound Kafka message handler throws.
 */
export interface IInboundHandlerErrorContext {
  /** The raw message that was being dispatched when the handler threw. */
  message: IInboundMessage;
  /** The error thrown by the handler (not normalized — the handler's own type). */
  error: unknown;
  /** The consumer group the message was received under. */
  groupId: string;
  /** The topic the message was received on. */
  topic: string;
}

/**
 * Optional extension point for an `inboundConsumers` entry. Implement this on
 * an injectable provider and reference its class via
 * `IInboundConsumerOptions.errorHandler` to receive matched-handler failures
 * instead of the kit's default log-and-swallow behavior.
 *
 * Resolved once per configured consumer group at bootstrap via
 * `ModuleRef.get(errorHandler, { strict: false })` — the class must be
 * registered as a provider somewhere in the app (it is not auto-registered by
 * `MessagingModule`, since it commonly needs app-specific dependencies). A
 * missing registration throws at bootstrap, before any consumer starts.
 */
export interface IInboundErrorHandler {
  onHandlerError(context: IInboundHandlerErrorContext): Promise<void>;
}
