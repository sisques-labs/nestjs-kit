# Criteria Filtering Specification

## Purpose

Filter operator semantics for the criteria subsystem, including the null
operators `IS_NULL` and `IS_NOT_NULL`, the rules for when a filter value is
required, and how each filter is translated to TypeORM and MongoDB queries and
accepted through the GraphQL input.

## ADDED Requirements

### Requirement: Null Filter Operators

`FilterOperator` MUST expose `IS_NULL = 'isnull'` and `IS_NOT_NULL = 'notnull'`
in addition to all existing members. The GraphQL enum registration MUST
include the new members.

#### Scenario: Enum exposes the new members

- GIVEN the `FilterOperator` enum
- WHEN its members are read
- THEN `IS_NULL` equals `'isnull'` and `IS_NOT_NULL` equals `'notnull'`
- AND the README documents 10 operators

#### Scenario: GraphQL enum registration includes null operators

- GIVEN the shared GraphQL enums are registered
- WHEN the registered `FilterOperator` values are inspected
- THEN `IS_NULL` and `IS_NOT_NULL` are present

### Requirement: Optional Filter Value

`Filter.value` MUST be optional (`value?: any`). A `Filter` MUST be
constructible with only `field` and `operator` when the operator is a null
operator. No boolean flag is introduced; the operator alone carries the meaning.

#### Scenario: Null-operator filter without value

- GIVEN a filter `{ field: 'deletedAt', operator: FilterOperator.IS_NULL }`
- WHEN it is built as a `Filter`
- THEN it compiles and `value` is `undefined`

### Requirement: TypeORM Null Translation

The TypeORM translator MUST render `IS_NULL` as `${column} IS NULL` and
`IS_NOT_NULL` as `${column} IS NOT NULL`, and MUST NOT bind any parameter for
these operators.

#### Scenario: IS_NULL

- GIVEN a criteria filter `{ field: 'deletedAt', operator: IS_NULL }`
- WHEN the criteria is applied to the query builder
- THEN a where clause `<alias>.deletedAt IS NULL` is added
- AND no parameters object is passed

#### Scenario: IS_NOT_NULL

- GIVEN a criteria filter `{ field: 'deletedAt', operator: IS_NOT_NULL }`
- WHEN the criteria is applied to the query builder
- THEN a where clause `<alias>.deletedAt IS NOT NULL` is added
- AND no parameters object is passed

### Requirement: MongoDB Null Translation

The Mongo query builder MUST translate `IS_NULL` to `{ $eq: null }` and
`IS_NOT_NULL` to `{ $ne: null }` on the filter field.

#### Scenario: IS_NULL

- GIVEN a filter `{ field: 'deletedAt', operator: IS_NULL }`
- WHEN the Mongo query is built
- THEN `query.deletedAt` equals `{ $eq: null }`

#### Scenario: IS_NOT_NULL

- GIVEN a filter `{ field: 'deletedAt', operator: IS_NOT_NULL }`
- WHEN the Mongo query is built
- THEN `query.deletedAt` equals `{ $ne: null }`

### Requirement: GraphQL Nullable Filter Value

`BaseFilterInput.value` MUST remain a `GraphQLJSON` field and MUST be nullable
and optional in the GraphQL schema, so clients can omit it or send `null`.
Inheriting inputs (including those from `create-filter-input.factory`) MUST
inherit this behavior.

#### Scenario: Schema permits omitted value

- GIVEN the GraphQL filter input type
- WHEN a client submits a filter with `operator: IS_NULL` and no `value`
- THEN the schema accepts the input

### Requirement: Conditional Value Validation

For every operator other than `IS_NULL` and `IS_NOT_NULL`, a missing value
(`undefined`) MUST be rejected. For null operators, value validation MUST be
skipped. This MUST be enforced in BOTH `FilterValidationPipe` (explicit check,
early return for null operators) AND `BaseFilterInput` (`@ValidateIf` plus
`@IsNotEmpty` applied only when the operator is not a null operator).

#### Scenario: Pipe accepts null operator without value

- GIVEN a filter `{ field: 'deletedAt', operator: IS_NULL }` with no value
- WHEN `FilterValidationPipe` processes it
- THEN no error is thrown and value-descriptor validation is skipped

#### Scenario: Pipe rejects other operator without value

- GIVEN a filter `{ field: 'name', operator: EQUALS }` with no value
- WHEN `FilterValidationPipe` processes it
- THEN a validation error for the missing value is thrown

#### Scenario: DTO accepts null operator without value

- GIVEN a `BaseFilterInput` with `operator: IS_NOT_NULL` and no `value`
- WHEN class-validator runs
- THEN there are no validation errors

#### Scenario: DTO rejects other operator without value

- GIVEN a `BaseFilterInput` with `operator: EQUALS` and no `value`
- WHEN class-validator runs
- THEN a validation error on `value` is reported

### Requirement: Existing Operators Unchanged

Behavior of all pre-existing operators other than `LIKE` (translation,
validation, GraphQL input) MUST NOT change. Adding enum members is the only
change visible to them. Existing tests for those operators MUST continue to
pass. `LIKE` translation is governed by "TypeORM LIKE Translation".
(Previously: all pre-existing operators, including `LIKE`, were unchanged.)

#### Scenario: Existing operator still requires a value

- GIVEN a filter `{ field: 'age', operator: GREATER_THAN, value: 18 }`
- WHEN translated for TypeORM and Mongo
- THEN the output is identical to the behavior before this change

#### Scenario: LIKE excluded from the unchanged guarantee

- GIVEN a `LIKE` filter on a TypeORM query
- WHEN translated
- THEN the cast, `ESCAPE` clause, and escaped value apply, unlike the prior plain `LIKE`

### Requirement: TypeORM LIKE Translation

The TypeORM translator MUST render `LIKE` as
`CAST(<alias>.<field> AS text) ILIKE :filterN ESCAPE '\'` for every column,
with no column-type branching. The bound value MUST have `\`, `%` and `_`
escaped with a backslash, then be wrapped as `%<escaped>%`. `LIKE` means a
case-insensitive, literal "contains".

#### Scenario: Exact SQL and parameter

- GIVEN a filter `{ field: 'name', operator: LIKE, value: 'ab' }`
- WHEN the criteria is applied to the query builder
- THEN the where clause is `CAST(<alias>.name AS text) ILIKE :filterN ESCAPE '\'`
- AND parameter `filterN` equals `'%ab%'`

#### Scenario: Non-text columns execute without error

- GIVEN PostgreSQL rows in date or timestamp, integer, and uuid columns
- WHEN a `LIKE` filter is applied to each column
- THEN the query executes without an operator error
- AND matching rows are returned (e.g. ISO fragment `2024-01` on a date)

#### Scenario: Text column regression

- GIVEN a text column containing `Alice` and `Bob`
- WHEN `LIKE` is applied with `ali`
- THEN only `Alice` is returned

#### Scenario: Literal percent

- GIVEN rows `100%` and `1000`
- WHEN `LIKE` is applied with `%`
- THEN the parameter is `'%\%%'` and only `100%` matches

#### Scenario: Literal underscore and backslash

- GIVEN rows `a_b`, `axb`, and `a\b`
- WHEN `LIKE` is applied with `_`, then with `\`
- THEN the escaped parameters are `'%\_%'` and `'%\\%'`
- AND only `a_b`, then only `a\b`, match

#### Scenario: Alias rewriting inside CAST

- GIVEN TypeORM 1.x against PostgreSQL
- WHEN `LIKE` runs through the query builder with an `alias.prop` reference
- THEN the property is resolved to the real column inside `CAST(...)`

#### Scenario: Peer range versus tested version

- GIVEN the peer range `typeorm >=0.3.0` and integration tests run on 1.x
- WHEN the translator is documented
- THEN the README states `LIKE` is verified on TypeORM 1.x only
- AND SQL emitted uses only `CAST`, `ILIKE`, and `ESCAPE`

### Requirement: Opt-in Database Integration Tests

The repository MUST provide a real-PostgreSQL integration suite
(`@testcontainers/postgresql` and `pg` as devDependencies) in `*.int-spec.ts`
files with a separate jest config, run via a `test:int` script. It MUST be
excluded from `pnpm test`, `test:cov`, and the coverage gate, and MUST NOT be
required to pass without Docker.


#### Scenario: Default test run needs no Docker

- GIVEN Docker is unavailable
- WHEN `pnpm test` and `test:cov` run
- THEN they pass and no `*.int-spec.ts` file executes or counts toward coverage

#### Scenario: Opt-in run

- GIVEN Docker is available
- WHEN `pnpm test:int` runs
- THEN a PostgreSQL container starts and the LIKE scenarios above execute against it

### Requirement: README Documentation

The README MUST document the null operators: the Mongo mapping table includes
both, operator counts read "10" instead of "8", and the enum listing uses the
real member names (replacing the stale `GT`/`LT`/`GTE`/`LTE`). It MUST note
that Mongo `$eq: null` also matches missing fields whereas SQL `IS NULL` does
not, and that multiple filters on one field in the Mongo builder overwrite each
other (known pre-existing limitation, not addressed here).

#### Scenario: Documentation reflects the change

- GIVEN the updated README
- WHEN the operator sections are read
- THEN both null operators appear in the Mongo table and the enum listing
- AND the missing-field semantic gap note is present

### Requirement: Test Coverage

Each affected spec file (TypeORM translator, Mongo repository, filter
validation pipe, base filter input, GraphQL enum registration) MUST include
per-operator cases for `IS_NULL` and `IS_NOT_NULL`.

#### Scenario: Specs cover new operators

- GIVEN the five affected spec files
- WHEN the test suite runs
- THEN each contains passing cases for both null operators

## Out of Scope

- The Mongo builder overwriting `query[field]` when several filters target the
  same field (pre-existing; documented only).
- Mongo `$regex` escaping, a `NOT_LIKE` operator, expression indexes, and CI
  wiring for `test:int`.
