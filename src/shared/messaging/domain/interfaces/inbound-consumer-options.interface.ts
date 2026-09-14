import { Type } from '@nestjs/common';

import { IInboundErrorHandler } from '../ports/inbound-error-handler.port';

/**
 * One declared inbound Kafka consumer group. Passed via
 * `IMessagingModuleOptions.inboundConsumers`; the kit calls
 * `IEventConsumer.run(groupId, topics, ...)` exactly once per entry at
 * `onApplicationBootstrap`.
 */
export interface IInboundConsumerOptions {
  /** Kafka consumer group id. */
  groupId: string;
  /** Topics this group subscribes to. */
  topics: string[];
  /**
   * Optional injectable class implementing {@link IInboundErrorHandler}.
   * Resolved via `ModuleRef.get(errorHandler, { strict: false })` at
   * bootstrap; must already be registered as a provider elsewhere in the app.
   */
  errorHandler?: Type<IInboundErrorHandler>;
}
