import { IOutboundEvent } from '../../../messaging/domain/interfaces/outbound-event.interface';

export const EVENT_STORE_WRITER = Symbol('EVENT_STORE_WRITER');

/**
 * Port for appending domain events to an event store. Implemented in
 * infrastructure (KurrentDB via the official gRPC client, or a no-op when
 * forwarding is disabled).
 *
 * Implementations MUST be best-effort: an append failure is logged by the
 * caller and never propagated to the command flow (the in-process `EventBus`
 * already delivered the event). The event store is a secondary, downstream
 * consumer — same contract as `IEventPublisher` (Kafka forwarding).
 */
export interface IEventStoreWriter {
  append(event: IOutboundEvent): Promise<void>;
}
