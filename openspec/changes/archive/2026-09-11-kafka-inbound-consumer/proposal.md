# Proposal: Declarative Kafka Inbound Consumer

## Intent

The kit already ships a raw inbound primitive (`EVENT_CONSUMER` / `KafkajsEventConsumerAdapter`), but consuming apps still hand-roll bootstrap wiring, topic subscription, body parsing, and dispatch. Issue #170 asks for the inbound mirror of the outbound `MessagingModule` generalization. Success: an app declares consumers and handlers, and writes no lifecycle or routing code.

## Scope

### In Scope

- Optional `inboundConsumers` entry on `IMessagingModuleOptions` (`{ groupId, topics, errorHandler? }`).
- `@KafkaMessageHandler({ topic, eventType? })` method decorator + `InboundHandlerRegistry` (`DiscoveryService` + `Reflector`), modeled on `McpToolRegistry`.
- An auto-start service that calls `IEventConsumer.run()` once per declared `groupId` and routes each message to matching handlers.
- Optional `IInboundErrorHandler` extension point per consumer.
- Additive re-exports from `src/entrypoints/messaging.ts`.
- Documented host-app `app.enableShutdownHooks()` requirement.

### Out of Scope

- Retry counts, backoff, DLQ topic naming/creation — the app owns these via the error hook.
- Inbound envelope/payload schema, `class-validator` integration, CommandBus dispatch.
- Adopting `@nestjs/microservices` or its Kafka transport.
- Any change to `IEventConsumer.run()` or the existing `aggregateModuleMap` option.

## Capabilities

### New Capabilities

- `kafka-inbound-consumer`: declarative inbound Kafka subscription, handler discovery, message routing, error delegation, and shutdown semantics.

### Modified Capabilities

- None. `openspec/specs/` is currently empty; no existing spec-level behavior changes.

## Approach

**Chosen: hybrid.** Subscription-level config is an options object; dispatch-level routing is a decorator.

Rejected **Option B alone** (options object only): it cannot express per-message-type dispatch inside one topic, so every handler re-implements the parse-and-switch boilerplate the issue exists to remove.

Rejected **Option A alone** (decorator only): a decorator must also carry `groupId`/broker config, and it would have to invent a routing key over an intentionally unopinionated inbound envelope.

The hybrid avoids that invention: the outbound publisher already writes the action into the `event-type` header, so routing on `topic` + optional `event-type` mirrors a contract the kit already owns. Broker config stays in `forRoot()` next to `aggregateModuleMap`; handlers stay in feature modules.

**Error handling.** Each `inboundConsumers` entry may name an injectable `IInboundErrorHandler` with `onHandlerError({ message, error, groupId, topic })`. Default when absent is today's log-and-swallow with auto-commit, so current behavior is unchanged.

**Lifecycle.** Keep `OnModuleDestroy`; `OnApplicationShutdown` fires after connections already close, too late for a clean consumer-group leave. Neither hook runs on SIGTERM/SIGINT unless the host calls `app.enableShutdownHooks()` — this MUST be documented as a host responsibility, not assumed.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/messaging/messaging-module-options.interface.ts` | Modified | Optional `inboundConsumers` |
| `src/shared/messaging/messaging.module.ts` | Modified | Register registry + bootstrap providers |
| `src/shared/messaging/domain/decorators/` | New | `@KafkaMessageHandler` + metadata constant |
| `src/shared/messaging/application/services/` | New | `InboundHandlerRegistry`, inbound bootstrap service |
| `src/shared/messaging/domain/ports/inbound-error-handler.port.ts` | New | Error extension point |
| `src/entrypoints/messaging.ts` (+ `.spec.ts`) | Modified | Additive re-exports |
| `package.json` | Unchanged | No new peer dependencies |

## Semver Assessment

**Minor.** Every change is additive: `inboundConsumers` is optional, `IEventConsumer.run()` and `aggregateModuleMap` are untouched, and default error behavior is preserved. Any deviation from this becomes **major** and must be escalated before apply.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Decorator routing semantics leak kit opinion onto payloads | Med | Route only on `topic` + `event-type` header; never parse `value` |
| Two discovery subsystems to maintain (`McpToolRegistry` + new) | Med | Copy the existing pattern verbatim; no new abstraction |
| Silent behavior change for current `EVENT_CONSUMER` users | Low | Auto-start only when `inboundConsumers` is present |
| 80% coverage gate on new branchy routing code | Med | TDD per `mcp-tool-registry.service.spec.ts` and `messaging.module.spec.ts` |
| Host omits `enableShutdownHooks()` → no clean group leave | High | Document explicitly; log a warning at bootstrap |

## Rollback Plan

All changes are additive and inert unless `inboundConsumers` is supplied. Revert the feature commits; `MessagingModule.forRoot({ aggregateModuleMap })` and direct `EVENT_CONSUMER` injection keep working unchanged. If already published, no consumer upgrade is required to roll back — the prior minor remains compatible.

## Dependencies

- None new. `kafkajs` and `@nestjs/config` are already optional peers gating `./messaging`.
- `@nestjs/core` (`DiscoveryService`, `Reflector`) is already a peer used by `McpToolRegistry`.

## Success Criteria

- [ ] An app declares `inboundConsumers` + `@KafkaMessageHandler` and writes zero lifecycle code.
- [ ] Existing `EVENT_CONSUMER` callers compile and behave identically with no option changes.
- [ ] A failing handler reaches a registered `IInboundErrorHandler`; without one, it logs and swallows as today.
- [ ] `pnpm test:cov` passes at the 80% threshold; `pnpm build` and `pnpm lint:check` pass.
- [ ] Host-app `enableShutdownHooks()` requirement is documented on the public API.
