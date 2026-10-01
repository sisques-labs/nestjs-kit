# Tasks: Criteria IS_NULL / IS_NOT_NULL Operators

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 200-280 (about 60 prod, 130 tests, 40 docs) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Null operators end to end (domain, translators, DTO, pipe, tests, docs) | PR 1 | `npx jest src/shared` | N/A: no DB integration tests exist; all mocked | Revert the single PR; purely additive |

## Phase 1: Foundation (domain)

- [x] 1.1 RED: add enum cases (IS_NULL=`isnull`, IS_NOT_NULL=`notnull`) to `src/shared/transport/graphql/register-shared-graphql-enums.spec.ts`. Verify: fails.
- [x] 1.2 In `src/shared/domain/enums/filter-operator.enum.ts` add both members, `NULL_FILTER_OPERATORS`, `isNullFilterOperator`. Verify: 1.1 passes.
- [x] 1.3 In `src/shared/domain/entities/criteria.ts` make `Filter.value` optional (`value?: any`). Verify: `npx tsc --noEmit`.

## Phase 2: Translators (RED then GREEN)

- [x] 2.1 RED: `it.each` in `apply-criteria-to-query-builder.spec.ts`: `andWhere` gets one arg `entity.deletedAt IS NULL` / `IS NOT NULL`; existing rows untouched.
- [x] 2.2 GREEN: two cases in `applyFilter` in `src/shared/infrastructure/database/typeorm/criteria/apply-criteria-to-query-builder.ts`, no params; JSDoc "all 8" to "all 10".
- [x] 2.3 RED: `base-mongo-database.repository.spec.ts` expects `deletedAt: { $eq: null }` / `{ $ne: null }`.
- [x] 2.4 GREEN: two cases before `default` in `buildMongoQuery` in `src/shared/infrastructure/database/mongodb/base-mongo/base-mongo-database.repository.ts`.

## Phase 3: Transport (RED then GREEN)

- [x] 3.1 RED: `base-filter.input.spec.ts` with `plainToInstance` + `validate`: null ops without value pass; EQUALS without value errors on `value`; EQUALS with `false` passes.
- [x] 3.2 GREEN: in `src/shared/transport/graphql/dtos/requests/base-filter/base-filter.input.ts` set nullable field, `@ValidateIf(!isNullFilterOperator)`, `@IsNotEmpty()`, `value?: unknown`, JSDoc.
- [x] 3.3 RED: `filter-validation.pipe.spec.ts`: null ops without value pass; null op on unknown field throws; EQUALS with `undefined` and `null` throws missing-value message.
- [x] 3.4 GREEN: in `src/shared/transport/graphql/pipes/filter-validation/filter-validation.pipe.ts` add null-op `continue` after the field check, then the missing-value `BadRequestException`.

## Phase 4: Verification and docs

- [x] 4.1 Run full suite `npx jest` and `npx tsc --noEmit`; confirm existing operator tests (e.g. GREATER_THAN) are unchanged.
- [x] 4.2 `README.md`: Mongo table with real names plus null rows (~line 625), "all 8" to "all 10" (~722), enum listing (~1185), notes on `$eq: null` matching missing fields and same-field overwrite.
- [x] 4.3 Add a changelog/release note (`feat(criteria)`) warning consumers with exhaustive `switch(FilterOperator)`; no root CHANGELOG exists, so put it in the PR description / release notes.
