# Exploration: criteria-null-operators

Source: Engram `sdd/criteria-null-operators/explore` (issue #211: IS_NULL='isnull', IS_NOT_NULL='notnull').

## Affected

- `src/shared/domain/enums/filter-operator.enum.ts`: add members.
- `domain/entities/criteria.ts`: `Filter.value: any` -> make optional `value?: any`.
- `typeorm/criteria/apply-criteria-to-query-builder.ts`: `applyFilter` switch, add `${column} IS NULL` / `IS NOT NULL` with no param; update JSDoc "all 8".
- `mongodb/base-mongo/base-mongo-database.repository.ts` `buildMongoQuery`: IS_NULL -> `{ $eq: null }` (also matches missing fields), IS_NOT_NULL -> `{ $ne: null }`.
- `graphql/dtos/requests/base-filter/base-filter.input.ts`: `value` has `@IsNotEmpty` and a required GraphQLJSON field; make `@Field` nullable + optional, enforce in the pipe.
- `graphql/pipes/filter-validation/filter-validation.pipe.ts`: `validateValue` needs an early return for null operators. It currently ALWAYS validates value against the descriptor, so `undefined` fails. No "missing value" check exists for other operators except `@IsNotEmpty` on the input DTO.
- `create-filter-input.factory.ts` extends `BaseFilterInput` (inherits, no change).
- `register-shared-graphql-enums.ts` registers the enum object (picks up new members automatically).
- `README.md`: ~line 625 Mongo table, ~722 "all 8", ~1185 enum list (already drifted: GT/LT/GTE/LTE vs real GREATER_THAN...).

## Specs to extend

`apply-criteria-to-query-builder.spec.ts` (it.each with mocked qb), `base-mongo-database.repository.spec.ts` (mocked collection), `filter-validation.pipe.spec.ts`, `base-filter.input.spec.ts`, `register-shared-graphql-enums.spec.ts`.

## Learned

- No DB integration tests exist (all mocks), so no integration test is needed.
- Only TypeORM and Mongo translators exist; find-by-criteria DTOs do not switch on operator.
- Recommended: optional `Filter.value` (not an isNull flag); GraphQL keeps GraphQLJSON value but nullable/optional; the pipe skips value validation for null operators and (new) rejects a missing/undefined value for the others.
- Mongo `$eq: null` matches missing fields; the Mongo builder overwrites same-field filters (pre-existing).
