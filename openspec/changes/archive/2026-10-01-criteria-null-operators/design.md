# Design: Criteria IS_NULL / IS_NOT_NULL Filter Operators

## Technical Approach

Additive change across the criteria layers. The operator alone carries null semantics; `Filter.value` becomes optional. A single domain predicate `isNullFilterOperator()` is the one source of truth used by the pipe and the DTO. Each translator gets two new `switch` cases. Implements every requirement in `specs/criteria-filtering/spec.md`.

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|---|---|---|---|
| Null-operator predicate | `NULL_FILTER_OPERATORS` + `isNullFilterOperator(op)` exported from `filter-operator.enum.ts` | Inline `op === IS_NULL \|\| op === IS_NOT_NULL` at each call site | One definition for pipe + DTO; root barrel (`src/index.ts` uses `export *`) exposes it to consumers writing custom translators |
| Pipe missing-value check | Reject `undefined` and `null` with a dedicated message | Reject only `undefined` | `null` was already rejected by every descriptor (`typeof` checks); a clear "missing value" message replaces "Invalid value undefined" |
| Pipe order | Unknown-field check first, then null-operator early `continue` | Skip null filters entirely | Null filters must still target a registered field |
| Value on null operator | Tolerated and ignored (pipe skips, translators never read it) | Reject a supplied value | No spec requirement; strictness can be added later without breaking clients |
| TypeORM | `qb.andWhere(\`${column} IS NULL\`)` with no params object | Bind `:filterN` as `null` | Spec forbids a parameter; `= NULL` is never true in SQL |
| Mongo | `{ $eq: null }` / `{ $ne: null }` | `$exists` | Confirmed; semantic gap documented |

## Data Flow

    GraphQL input ──> class-validator (BaseFilterInput: @ValidateIf + @IsNotEmpty)
          │
          └──> FilterValidationPipe (field known? -> null op? continue : value present? -> descriptor)
                    │
                    └──> Criteria.filters ──> applyCriteriaToQueryBuilder  (IS [NOT] NULL)
                                          └──> buildMongoQuery             ({$eq|$ne: null})

## File Changes

| File | Action | Description |
|---|---|---|
| `src/shared/domain/enums/filter-operator.enum.ts` | Modify | Add `IS_NULL = 'isnull'`, `IS_NOT_NULL = 'notnull'`, `NULL_FILTER_OPERATORS`, `isNullFilterOperator` |
| `src/shared/domain/entities/criteria.ts` | Modify | `value?: any` |
| `src/shared/infrastructure/database/typeorm/criteria/apply-criteria-to-query-builder.ts` | Modify | Two cases in `applyFilter`; JSDoc "all 8" -> "all 10", note no param for null ops |
| `src/shared/infrastructure/database/mongodb/base-mongo/base-mongo-database.repository.ts` | Modify | Two cases in `buildMongoQuery` before `default` |
| `src/shared/transport/graphql/dtos/requests/base-filter/base-filter.input.ts` | Modify | Nullable field, `@ValidateIf`, `value?: unknown`, JSDoc |
| `src/shared/transport/graphql/pipes/filter-validation/filter-validation.pipe.ts` | Modify | Early `continue` + explicit missing-value check |
| Five matching `*.spec.ts` | Modify | See Testing Strategy |
| `README.md` | Modify | See README edits |

`create-filter-input.factory.ts` and `register-shared-graphql-enums.ts` need no change (inheritance / enum object registration).

## Interfaces / Contracts

```ts
// filter-operator.enum.ts
export const NULL_FILTER_OPERATORS: readonly FilterOperator[] = [
  FilterOperator.IS_NULL, FilterOperator.IS_NOT_NULL,
];
export const isNullFilterOperator = (op: FilterOperator): boolean =>
  NULL_FILTER_OPERATORS.includes(op);

// base-filter.input.ts
@Field(() => GraphQLJSON, { nullable: true, description: 'The value to filter by (omit for IS_NULL / IS_NOT_NULL)' })
@ValidateIf((o: BaseFilterInput) => !isNullFilterOperator(o.operator))
@IsNotEmpty()
value?: unknown;

// filter-validation.pipe.ts, inside transform() loop, after the descriptor check
if (isNullFilterOperator(filter.operator)) continue;
if (filter.value === undefined || filter.value === null) {
  throw new BadRequestException(
    `Missing value for filter field "${filter.field}" with operator "${filter.operator}"`,
  );
}
this.validateValue(...);
```

`@ValidateIf` returning `false` skips every validator on `value`; an invalid operator still yields `true`, so `@IsNotEmpty` keeps applying.

## Testing Strategy

All unit, mocked (no DB integration tests exist).

| Spec file | Cases |
|---|---|
| `apply-criteria-to-query-builder.spec.ts` | `it.each` over IS_NULL/IS_NOT_NULL: `andWhere` called with exactly one argument (`'entity.deletedAt IS NULL'` / `IS NOT NULL`); existing operator rows unchanged |
| `base-mongo-database.repository.spec.ts` | Built query has `deletedAt: { $eq: null }` / `{ $ne: null }` |
| `filter-validation.pipe.spec.ts` | Null ops without value pass; null op on unknown field still throws; EQUALS with `undefined` and with `null` throws missing-value message |
| `base-filter.input.spec.ts` | Use `plainToInstance` + `validate`: IS_NULL/IS_NOT_NULL without value -> no errors; EQUALS without value -> error on `value`; EQUALS with `false` -> no errors |
| `register-shared-graphql-enums.spec.ts` | `FilterOperator.IS_NULL === 'isnull'`, `IS_NOT_NULL === 'notnull'`; registration call still succeeds |

## README Edits

- Line ~625 Mongo table: rename `GT/LT/GTE/LTE` rows to real names, add `IS_NULL | $eq: null` and `IS_NOT_NULL | $ne: null`; add notes on the missing-field semantic gap and the pre-existing same-field overwrite.
- Line ~722: "all 8" -> "all 10"; note null operators bind no parameter.
- Line ~1185 enum listing: real member names plus the two new members.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Minor release via `feat(criteria)`; changelog note for consumers with an exhaustive `switch(FilterOperator)`.

## Open Questions

- None blocking.
