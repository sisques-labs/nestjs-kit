# Delta for Criteria Filtering

## ADDED Requirements

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

(Replaces the former out-of-scope note "Database integration tests", which MUST
be removed from the Out of Scope section at archive.)

#### Scenario: Default test run needs no Docker

- GIVEN Docker is unavailable
- WHEN `pnpm test` and `test:cov` run
- THEN they pass and no `*.int-spec.ts` file executes or counts toward coverage

#### Scenario: Opt-in run

- GIVEN Docker is available
- WHEN `pnpm test:int` runs
- THEN a PostgreSQL container starts and the LIKE scenarios above execute against it

## MODIFIED Requirements

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

## Out of Scope (updated)

- Mongo `$regex` escaping, a `NOT_LIKE` operator, expression indexes, CI wiring
  for `test:int`.
