# Design: Declarative Kafka Inbound Consumer

## Technical Approach

Two new `application` services sit on top of the unchanged `IEventConsumer` port. `InboundHandlerRegistry` mirrors `McpToolRegistry` (separate copy, no shared abstraction) and indexes `@KafkaMessageHandler` methods at `onModuleInit`. `InboundConsumerBootstrapService` then calls `IEventConsumer.run()` once per declared `groupId` at `onApplicationBootstrap` and routes each `IInboundMessage` by `topic` + the `event-type` header (confirmed written by `KafkajsEventPublisherAdapter.buildHeaders`). `IInboundMessage.value` is never parsed. Everything is inert unless `inboundConsumers` is supplied, keeping the change minor.

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|---|---|---|---|
| Start hook | `OnApplicationBootstrap` on the bootstrap service | `OnModuleInit` | `onApplicationBootstrap` runs strictly after **all** `onModuleInit` hooks, so the registry is guaranteed populated and app feature providers instantiated. Same-module `onModuleInit` ordering is insertion-order-dependent and fragile. |
| Stop hook | `OnModuleDestroy` on the bootstrap service (flag only) | `OnApplicationShutdown` | Per research, `onApplicationShutdown` fires after connections close — too late to leave the group. The adapter already disconnects in its own `onModuleDestroy`; the service only sets `isShuttingDown` so no new dispatch starts. Both are order-independent. |
| Method discovery | `DiscoveryService.getProviders()` + `MetadataScanner.getAllMethodNames()` + `Reflector` | `DiscoveryService.getProviders({ metadataKey })` | `@KafkaMessageHandler` is a **method** decorator; `McpTool` is a class decorator, so the MCP loop needs `MetadataScanner` added. Both are exported by `DiscoveryModule` (verified in `node_modules/@nestjs/core/discovery/discovery-module.js`). Providers only — controllers are not handler hosts. |
| Error handler resolution | `ModuleRef.get(consumer.errorHandler, { strict: false })` at bootstrap | Registering the class in `MessagingModule` providers | The handler lives in an app feature module with app-specific deps; registering it inside the (global) `MessagingModule` would fail to resolve those deps. Accepts a narrow service-locator tradeoff, as `@nestjs/bull` does. |
| Failure isolation | Bootstrap service catches per handler, then calls the hook or logs | Rethrow into the adapter's existing catch | Rethrowing would abort the remaining handlers matching the same message. Log text/severity mirrors the adapter so default behavior is unchanged for users. |
| `DiscoveryModule` import | Always imported by `forRoot()` | Conditional import | No side effects and no scan cost unless a registry uses it; conditional imports complicate `messaging.module.spec.ts`. Only the two providers are conditional. |
| Registry export | Not added to `exports` | Export `InboundHandlerRegistry` | Exporting a conditionally-registered provider throws when `inboundConsumers` is absent. Public exports stay unchanged. |

Routing rule: a handler matches when `topic` is equal **and** (`eventType` is undefined **or** equals `headers['event-type']`). Catch-all and specific handlers both run, sequentially, each isolated.

## Data Flow

    Kafka ─→ KafkajsEventConsumerAdapter.run(groupId, topics, cb)
                          │ IInboundMessage
                          ▼
        InboundConsumerBootstrapService.dispatch()
                          │ topic + headers['event-type']
                          ▼
        InboundHandlerRegistry.findHandlers() ─→ [bound methods]
                          │ throw
                          ▼
        IInboundErrorHandler.onHandlerError()  (else log + swallow)

Init: `onModuleInit` (registry scan) → `onApplicationBootstrap` (one `run()` per `groupId`, warn about `enableShutdownHooks()`).
Destroy: `onModuleDestroy` sets `isShuttingDown` → adapter `onModuleDestroy` disconnects consumers (group leave).

## File Changes

| File | Action | Description |
|---|---|---|
| `src/shared/messaging/domain/constants/messaging.constants.ts` | Modify | Add `KAFKA_MESSAGE_HANDLER_METADATA = Symbol('messaging:kafka-message-handler')`, `INBOUND_CONSUMERS = Symbol('INBOUND_CONSUMERS')`, `EVENT_TYPE_HEADER = 'event-type'` |
| `src/shared/messaging/domain/decorators/kafka-message-handler.decorator.ts` | Create | `KafkaMessageHandler(options): MethodDecorator` via `SetMetadata` |
| `src/shared/messaging/domain/interfaces/kafka-message-handler-options.interface.ts` | Create | `IKafkaMessageHandlerOptions` |
| `src/shared/messaging/domain/interfaces/inbound-consumer-options.interface.ts` | Create | `IInboundConsumerOptions` |
| `src/shared/messaging/domain/ports/inbound-error-handler.port.ts` | Create | `IInboundErrorHandler`, `IInboundHandlerErrorContext` |
| `src/shared/messaging/application/services/inbound-handler-registry.service.ts` | Create | Discovery + topic index + `findHandlers()` |
| `src/shared/messaging/application/services/inbound-consumer-bootstrap.service.ts` | Create | Auto-start, dispatch, error delegation, shutdown flag |
| `src/shared/messaging/messaging-module-options.interface.ts` | Modify | Optional `inboundConsumers?: readonly IInboundConsumerOptions[]` + JSDoc naming `app.enableShutdownHooks()` |
| `src/shared/messaging/messaging.module.ts` | Modify | Import `DiscoveryModule`; conditionally add `INBOUND_CONSUMERS`, registry, bootstrap; JSDoc example |
| `src/entrypoints/messaging.ts` | Modify | Six additive `export *` lines |
| `README.md` | Modify | New `### Kafka inbound consumers` under `## Infrastructure Layer` (before `## Transport Layer (GraphQL)`) + ToC entry, stating `enableShutdownHooks()` is host-owned |

## Interfaces / Contracts

```ts
export interface IKafkaMessageHandlerOptions {
  topic: string;
  /** Matched against the `event-type` header; omit for a topic catch-all. */
  eventType?: string;
}

export interface IInboundConsumerOptions {
  groupId: string;
  topics: string[];
  errorHandler?: Type<IInboundErrorHandler>;
}

export interface IInboundHandlerErrorContext {
  message: IInboundMessage;
  error: unknown;
  groupId: string;
  topic: string;
}

export interface IInboundErrorHandler {
  onHandlerError(context: IInboundHandlerErrorContext): Promise<void>;
}
```

Docs placement (host responsibility, three anchors): JSDoc on `IMessagingModuleOptions.inboundConsumers`, JSDoc on `MessagingModule.forRoot`, and the README subsection — plus one `logger.warn` at bootstrap when `inboundConsumers` is non-empty.

## Testing Strategy

Strict TDD; RED spec first, colocated `*.spec.ts`, `pnpm test:cov` ≥ 80%.

| New/updated spec | Pattern source | Key cases |
|---|---|---|
| `inbound-handler-registry.service.spec.ts` | `mcp-tool-registry.service.spec.ts` | Mocked `DiscoveryService`/`MetadataScanner`/`Reflector`; undecorated providers, null instances, duplicate topics, catch-all vs `eventType` match, unknown topic → empty |
| `inbound-consumer-bootstrap.service.spec.ts` | `kafkajs-event-consumer.adapter.spec.ts` | One `run()` per `groupId`; missing/empty/unexpected `event-type` header; no match → no-op; handler throws → hook called; no hook → log-and-swallow; hook throws → swallowed; `onModuleDestroy` stops dispatch |
| `kafka-message-handler.decorator.spec.ts` | `mcp-tool.decorator.spec.ts` | Metadata written on the method |
| `messaging.module.spec.ts` | existing | Providers absent without `inboundConsumers`, present with; exports unchanged |
| `messaging.spec.ts` (entrypoint) | existing | New symbols re-exported |

## Threat Matrix

N/A — no shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. The untrusted-input surface (broker-supplied `topic`/`event-type`) is covered by the routing cases above: headers are used only for exact-string lookup in an in-memory map, never for parsing, file paths, or code execution.

## Migration / Rollout

No migration. Additive and inert without `inboundConsumers`; existing `EVENT_CONSUMER` injection is unaffected. Revert the feature commits to roll back.

## Open Questions

- None blocking.
