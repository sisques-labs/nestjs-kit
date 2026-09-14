# Kafka Inbound Consumer Specification

## Purpose

Declarative subscription and dispatch for inbound Kafka messages, built on the
existing `IEventConsumer` port. An app declares `inboundConsumers` on
`IMessagingModuleOptions` and marks methods with `@KafkaMessageHandler`; the
kit discovers handlers, starts one consumer per `groupId`, and routes each
message by `topic` + optional `event-type` header, without parsing `value`.

## Requirements

### Requirement: Inbound Consumer Declaration

`IMessagingModuleOptions` MUST accept an optional `inboundConsumers` array,
each entry `{ groupId: string; topics: string[]; errorHandler?: Type<IInboundErrorHandler> }`.
Omitting `inboundConsumers` MUST NOT change any existing behavior.

#### Scenario: App declares one consumer group

- GIVEN `MessagingModule.forRoot({ aggregateModuleMap, inboundConsumers: [{ groupId: 'orders', topics: ['svc.orders'] }] })`
- WHEN the app module compiles
- THEN the module resolves with no error and no new required providers

#### Scenario: Option omitted preserves current behavior

- GIVEN `MessagingModule.forRoot({ aggregateModuleMap })` with no `inboundConsumers`
- WHEN the app boots
- THEN `EVENT_CONSUMER` is still injectable and no consumer auto-starts

### Requirement: Message Handler Decorator

A `@KafkaMessageHandler({ topic: string; eventType?: string })` method
decorator MUST attach routing metadata to the decorated method, readable via
`Reflector`, without altering the method's runtime behavior when called
directly.

#### Scenario: Decorator attaches readable metadata

- GIVEN a provider method decorated `@KafkaMessageHandler({ topic: 'svc.orders', eventType: 'OrderCreated' })`
- WHEN `Reflector.get(...)` reads the method's metadata
- THEN it returns `{ topic: 'svc.orders', eventType: 'OrderCreated' }`

### Requirement: Handler Discovery at Bootstrap

`InboundHandlerRegistry` MUST scan all providers via `DiscoveryService` once
at `onModuleInit`, collect every method carrying `@KafkaMessageHandler`
metadata, and index it by `topic` (and `eventType` when present).

#### Scenario: Multiple handlers across providers are discovered

- GIVEN two providers each expose one `@KafkaMessageHandler`-decorated method
- WHEN `InboundHandlerRegistry.onModuleInit()` runs
- THEN both handlers are registered and retrievable by their `topic`/`eventType`

#### Scenario: No decorated handlers exist

- GIVEN no provider declares `@KafkaMessageHandler`
- WHEN `onModuleInit()` runs
- THEN the registry ends empty and logs a discovery count of zero, without throwing

### Requirement: Consumer Auto-Start

WHEN `inboundConsumers` is non-empty, the kit MUST call `IEventConsumer.run()`
exactly once per declared `groupId`, subscribing to that entry's `topics`.
WHEN `inboundConsumers` is absent or empty, the kit MUST NOT call `run()`.

#### Scenario: One `run()` call per declared group

- GIVEN two `inboundConsumers` entries with distinct `groupId`s
- WHEN the module bootstraps
- THEN `IEventConsumer.run()` is called exactly twice, once per `groupId`, each with its own `topics`

### Requirement: Inbound Message Routing

Each inbound message MUST be routed to every discovered handler whose `topic`
matches the message's `topic` AND whose `eventType` (if declared) equals the
message's `event-type` header. The kit MUST NOT parse or inspect `value` for
routing. A message matching zero handlers MUST be logged and dropped without
throwing.

#### Scenario: Message routed by topic and event-type header

- GIVEN a handler registered for `{ topic: 'svc.orders', eventType: 'OrderCreated' }`
- WHEN a message arrives on `svc.orders` with header `event-type: OrderCreated`
- THEN that handler is invoked with the raw `IInboundMessage`

#### Scenario: Message with no matching handler

- GIVEN no handler is registered for `svc.orders` / `event-type: OrderShipped`
- WHEN such a message arrives
- THEN no handler is invoked, a message is logged, and the consumer keeps running

### Requirement: Error Handling Extension Point

An `inboundConsumers` entry MAY declare an injectable `IInboundErrorHandler`
implementing `onHandlerError({ message, error, groupId, topic })`. WHEN a
handler throws AND `errorHandler` is configured, the kit MUST invoke it.
WHEN absent, the kit MUST preserve today's log-and-swallow behavior.

#### Scenario: Custom error handler is invoked on failure

- GIVEN a consumer entry configured with an `errorHandler` provider
- WHEN a matched handler throws for a message
- THEN `onHandlerError` is called with the message, error, `groupId`, and `topic`, and the consumer keeps running

#### Scenario: Default behavior when no error handler is configured

- GIVEN a consumer entry with no `errorHandler`
- WHEN a matched handler throws
- THEN the error is logged, swallowed, and the consumer keeps running (unchanged from current `KafkajsEventConsumerAdapter` behavior)

### Requirement: Shutdown Lifecycle and Host Responsibility

The kit MUST continue using `OnModuleDestroy` (not `OnApplicationShutdown`)
for consumer cleanup. Public documentation MUST state that `OnModuleDestroy`
only runs on SIGTERM/SIGINT if the host app calls `app.enableShutdownHooks()`,
and that this call is a host-application responsibility the kit cannot
enable itself.

#### Scenario: Documented host responsibility

- GIVEN the published package documentation for inbound consumers
- WHEN a developer reads the setup section
- THEN it explicitly instructs calling `app.enableShutdownHooks()` for clean consumer-group shutdown

### Requirement: Additive Public API Surface

All new public symbols (`KafkaMessageHandler`, `InboundHandlerRegistry`,
`IInboundErrorHandler`, related types) MUST be re-exported from
`src/entrypoints/messaging.ts` additively. No existing exported symbol,
type, or function signature MAY change.

#### Scenario: Existing exports remain unchanged

- GIVEN the current `src/entrypoints/messaging.ts` exports
- WHEN this change is applied
- THEN every prior export still resolves to the same signature, and only new symbols are added
