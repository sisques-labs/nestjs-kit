# Proposal: Criteria IS_NULL / IS_NOT_NULL Filter Operators

## Intent

Consumers cannot filter on null or absent values (issue #211). Add `IS_NULL` / `IS_NOT_NULL` operators that work end to end: domain, both translators, and GraphQL input.

## Scope

### In Scope
- `FilterOperator.IS_NULL = 'isnull'`, `FilterOperator.IS_NOT_NULL = 'notnull'`; `Filter.value` becomes optional (no boolean flag).
- TypeORM: `${column} IS NULL` / `IS NOT NULL` with no bound parameter.
- Mongo: `{ $eq: null }` / `{ $ne: null }`.
- GraphQL `BaseFilterInput.value`: still GraphQLJSON, now nullable/optional.
- "Value required for non-null operators" is enforced in BOTH `FilterValidationPipe` (explicit check, skipped for null operators) AND the DTO (`@ValidateIf` + `@IsNotEmpty` when the operator is not a null operator).
- README: Mongo mapping table, "all 8 operators" text, enum listing (fix the stale GT/LT/GTE/LTE names), and a note that Mongo `$eq: null` also matches missing fields while SQL `IS NULL` does not.
- Unit tests per operator in every affected spec.
- Minor release via a `feat(criteria)` commit; changelog note for consumers with an exhaustive `switch(FilterOperator)`.

### Out of Scope
- The Mongo builder overwriting `query[field]` when several filters target one field (pre-existing). Documented in the README, with an optional follow-up issue.
- DB integration tests (the repo only has mocked specs).

## Capabilities

### New Capabilities
- `criteria-filtering`: filter operator semantics, including null operators, value-required rules, and TypeORM/Mongo translation.

### Modified Capabilities
- None (no existing spec under `openspec/specs/` covers criteria).

## Approach

Optional `value` instead of a flag, so the operator alone carries the meaning. Each translator gets a new switch case. The pipe returns early for null operators and rejects a missing value for the others, mirrored by a conditional class-validator rule on the DTO. Enum registration picks up the new members automatically.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/domain/enums/filter-operator.enum.ts` | Modified | Two new members |
| `src/shared/domain/entities/criteria.ts` | Modified | `value?: any` |
| `src/shared/infrastructure/database/typeorm/criteria/apply-criteria-to-query-builder.ts` | Modified | New cases, JSDoc |
| `src/shared/infrastructure/database/mongodb/base-mongo/base-mongo-database.repository.ts` | Modified | `buildMongoQuery` cases |
| `src/shared/transport/graphql/dtos/requests/base-filter/base-filter.input.ts` | Modified | Nullable value, conditional validation |
| `src/shared/transport/graphql/pipes/filter-validation/filter-validation.pipe.ts` | Modified | Skip/require value |
| Matching `*.spec.ts` (5 files) | Modified | Per-operator tests |
| `README.md` | Modified | Docs and drift fixes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Exhaustive `switch(FilterOperator)` in consumers stops compiling | Med | Changelog note; minor bump |
| Optional `value` lets malformed non-null filters through | Low | Double enforcement (pipe + DTO) with tests |
| Mongo/SQL semantic gap on missing fields | Med | README note |

## Rollback Plan

Revert the `feat(criteria)` commit and publish a patch. The changes are additive and touch no stored data.

## Dependencies

- None.

## Success Criteria

- [ ] Both operators translate correctly in TypeORM (no param) and Mongo.
- [ ] GraphQL accepts null operators without `value` and rejects other operators without `value`.
- [ ] All affected specs pass with new per-operator cases.
- [ ] README reflects 10 operators and the correct enum names.
