# Tasks: Declarative Kafka Inbound Consumer

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~950-1100 (7 new files + specs, 6 modified files incl. README) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 -> PR 2 -> PR 3 -> PR 4 -> PR 5 |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main (base: develop) |

Decision needed before apply: Yes (resolved)
Chained PRs recommended: Yes (done — 5 PRs created)
Chain strategy: stacked-to-main (base: develop)
400-line budget risk: High

Resolved chain: stacked-to-main onto `develop`.
- PR1 https://github.com/sisques-labs/nestjs-kit/pull/171 (`feat/kafka-inbound-consumer-foundations` -> `develop`)
- PR2 https://github.com/sisques-labs/nestjs-kit/pull/172 (`feat/kafka-inbound-consumer-registry` -> PR1 branch)
- PR3 https://github.com/sisques-labs/nestjs-kit/pull/173 (`feat/kafka-inbound-consumer-bootstrap` -> PR2 branch)
- PR4 https://github.com/sisques-labs/nestjs-kit/pull/174 (`feat/kafka-inbound-consumer-wiring` -> PR3 branch)
- PR5 https://github.com/sisques-labs/nestjs-kit/pull/175 (`feat/kafka-inbound-consumer-docs` -> PR4 branch)

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Domain foundations: constants, `@KafkaMessageHandler`, interfaces, `IInboundErrorHandler` port | PR 1 | `pnpm test -- kafka-message-handler.decorator` | N/A (pure metadata/type files, no runtime wiring yet) | Revert 4 new files + constants diff; nothing else references them yet |
| 2 | `InboundHandlerRegistry` discovery/indexing service | PR 2 | `pnpm test -- inbound-handler-registry.service` | N/A (unit-tested against mocked `DiscoveryService`) | Revert 2 new files; not yet wired into `MessagingModule` |
| 3 | `InboundConsumerBootstrapService` auto-start, routing, error delegation, shutdown | PR 3 | `pnpm test -- inbound-consumer-bootstrap.service` | N/A (unit-tested against mocked `IEventConsumer`/`ModuleRef`) | Revert 2 new files; not yet wired into `MessagingModule` |
| 4 | Module wiring + public API: `messaging.module.ts`, options interface, entrypoint exports | PR 4 | `pnpm test -- messaging.module messaging.spec` | `pnpm build` (verifies subpath entrypoint compiles/exports) | Revert conditional-provider block in `messaging.module.ts`; feature stays inert |
| 5 | README documentation for inbound consumers | PR 5 | N/A (docs-only) | N/A (docs-only) | Revert README section + ToC entry |

## Phase 1: Domain Foundations

- [x] 1.1 Modify `src/shared/messaging/domain/constants/messaging.constants.ts`: add `KAFKA_MESSAGE_HANDLER_METADATA`, `INBOUND_CONSUMERS`, `EVENT_TYPE_HEADER`.
- [x] 1.2 Create `src/shared/messaging/domain/interfaces/kafka-message-handler-options.interface.ts` (`IKafkaMessageHandlerOptions`).
- [x] 1.3 Create `src/shared/messaging/domain/interfaces/inbound-consumer-options.interface.ts` (`IInboundConsumerOptions`).
- [x] 1.4 Create `src/shared/messaging/domain/ports/inbound-error-handler.port.ts` (`IInboundErrorHandler`, `IInboundHandlerErrorContext`).
- [x] 1.5 RED: create `src/shared/messaging/domain/decorators/kafka-message-handler.decorator.spec.ts` (pattern: `mcp-tool.decorator.spec.ts`) asserting `Reflector`-readable metadata per Requirement "Message Handler Decorator".
- [x] 1.6 GREEN: create `src/shared/messaging/domain/decorators/kafka-message-handler.decorator.ts` implementing `KafkaMessageHandler(options)` via `SetMetadata`.

## Phase 2: Handler Registry

- [x] 2.1 RED: create `src/shared/messaging/application/services/inbound-handler-registry.service.spec.ts` (pattern: `mcp-tool-registry.service.spec.ts`) covering: multi-provider discovery, undecorated providers ignored, null instances skipped, zero-handler empty-registry log, catch-all vs `eventType` match, unknown-topic lookup returns empty.
- [x] 2.2 GREEN: create `src/shared/messaging/application/services/inbound-handler-registry.service.ts` — `onModuleInit` scan via `DiscoveryService.getProviders()` + `MetadataScanner.getAllMethodNames()` + `Reflector`; index by `topic`/`eventType`; `findHandlers()`.

## Phase 3: Bootstrap, Routing, Error Handling

- [x] 3.1 RED: create `src/shared/messaging/application/services/inbound-consumer-bootstrap.service.spec.ts` (pattern: `kafkajs-event-consumer.adapter.spec.ts`) covering: one `run()` per declared `groupId` with its own `topics`; no `run()` when `inboundConsumers` absent/empty; routing match on `topic` + `event-type` header; missing `event-type` header routes only to catch-all handlers; unexpected/unmatched `event-type` value drops with log, no throw; zero-match message logged and dropped, consumer keeps running; handler throws + `errorHandler` configured invokes `onHandlerError` with `{ message, error, groupId, topic }`; handler throws + no `errorHandler` logs and swallows (adapter-parity); `errorHandler` itself throws is swallowed; bootstrap-time throw when `errorHandler` class is not registered as a provider (`ModuleRef.get(..., { strict: false })` service-locator lookup fails); `onModuleDestroy` sets `isShuttingDown` and stops further dispatch.
- [x] 3.2 GREEN: create `src/shared/messaging/application/services/inbound-consumer-bootstrap.service.ts` — `onApplicationBootstrap` calls `IEventConsumer.run()` once per `groupId`; `dispatch()` resolves handlers via `InboundHandlerRegistry.findHandlers()`, invokes sequentially with per-handler isolation, delegates to `IInboundErrorHandler` or logs/swallows; `onModuleDestroy` flags `isShuttingDown`.

## Phase 4: Module Wiring and Public API

- [x] 4.1 Modify `src/shared/messaging/messaging-module-options.interface.ts`: add optional `inboundConsumers?: readonly IInboundConsumerOptions[]` with JSDoc naming `app.enableShutdownHooks()`.
- [x] 4.2 RED: extend `src/shared/messaging/messaging.module.spec.ts` with cases: no `inboundConsumers` -> no new providers, `EVENT_CONSUMER` still exported; `inboundConsumers` present -> `INBOUND_CONSUMERS`, `InboundHandlerRegistry`, `InboundConsumerBootstrapService` all provided; existing `exports` array unchanged.
- [x] 4.3 GREEN: modify `src/shared/messaging/messaging.module.ts` — import `DiscoveryModule`; conditionally register `INBOUND_CONSUMERS` value provider + the two new services when `options.inboundConsumers` is non-empty; add JSDoc example; do not add to `exports`.
- [x] 4.4 Modify `src/entrypoints/messaging.ts`: add 6 additive `export *` lines for the new decorator, interfaces, port, and services.
- [x] 4.5 RED+GREEN: extend `src/entrypoints/messaging.spec.ts` asserting the new symbols are re-exported and all prior exports still resolve to the same signatures.

## Phase 5: Documentation

- [x] 5.1 Modify `README.md`: add `### Kafka inbound consumers` under `## Infrastructure Layer` (before `## Transport Layer (GraphQL)`) with a ToC entry, documenting `@KafkaMessageHandler`, `inboundConsumers`, `IInboundErrorHandler`, and that `app.enableShutdownHooks()` is host-owned per Requirement "Shutdown Lifecycle and Host Responsibility".

## Phase 6: Verification

- [x] 6.1 Run `pnpm test:cov`; confirm 80% branches/functions/lines/statements threshold across all new files.
- [x] 6.2 Run `pnpm build` to confirm the `/messaging` subpath entrypoint compiles and type-checks with the additive exports.
- [x] 6.3 Run `pnpm lint:check` on all new/modified files.
