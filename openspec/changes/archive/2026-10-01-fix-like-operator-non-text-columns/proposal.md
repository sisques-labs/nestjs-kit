# Proposal: Fix LIKE Operator on Non-Text Columns

## Intent

`FilterOperator.LIKE` fails in PostgreSQL on date, timestamp, integer, and uuid columns (`operator does not exist: date ~~* unknown`, issue #212). User values that contain `%` or `_` also act as wildcards when they should not.

## Scope

### In Scope
- TypeORM `LIKE` renders `CAST(${alias}.${field} AS text) ILIKE :filterN ESCAPE '\'` for every column. There is no metadata branching.
- Escape `\`, `%`, `_` in the value before wrapping it in `%...%`, so `LIKE` means a literal "contains".
- Update the unit spec for the exact SQL string and the escaping cases.
- Add a real-PostgreSQL integration test using `@testcontainers/postgresql` and `pg`, with `*.int-spec.ts` files, a separate jest config, and a `test:int` script. It covers:
  - date or timestamp, integer, and uuid columns
  - a text-column regression
  - literal `%` and `_`
  - TypeORM 1.0 rewriting `alias.prop` inside `CAST(...)`
- Keep the integration test out of `pnpm test`, `test:cov`, and the coverage gate.
- Add `@testcontainers/postgresql` and `pg` as devDependencies.
- README: document `LIKE` semantics (cast, literal contains, `DateStyle` formatting, index note).
- Delta to `criteria-filtering`.

### Out of Scope
- Mongo `$regex` escaping (follow-up issue).
- A `NOT_LIKE` operator, expression indexes, and CI wiring for `test:int`.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `criteria-filtering`:
  - Adds a "TypeORM LIKE Translation" requirement (cast plus literal escaping).
  - Narrows the "Existing Operators Unchanged" requirement for `LIKE`.
  - Replaces the out-of-scope "Database integration tests" note with an opt-in integration-test requirement.

## Approach

- A small `escapeLikePattern` helper inside the translator.
- A single `LIKE` code path. Casting text to text is a no-op.

**Release impact: patch (`fix(criteria)`).** The README never documented wildcard pass-through, and the translator always wrapped values in `%...%`, which signals "contains" intent. The changelog will note that `%` and `_` are now literal.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/infrastructure/database/typeorm/criteria/apply-criteria-to-query-builder.ts` | Modified | Cast, escape, `ESCAPE` |
| `.../apply-criteria-to-query-builder.spec.ts` | Modified | SQL string, escaping cases |
| `.../apply-criteria-to-query-builder.int-spec.ts` | New | Testcontainers suite |
| `jest` int config, `package.json` | Modified | `test:int`, devDeps |
| `openspec/specs/criteria-filtering/spec.md` | Modified | Delta at archive |
| `README.md` | Modified | `LIKE` semantics |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CAST disables btree or pg_trgm indexes on text columns | Med | README: use an expression index on `(col::text)` |
| Consumers relying on wildcards in `LIKE` values | Low | Changelog note; patch with an explicit note |
| TypeORM 1.0 does not rewrite `alias.prop` inside `CAST` | Low | Integration test asserts it; fall back to the resolved column name |
| Date text depends on `DateStyle` | Med | Document it; the integration test uses an ISO search fragment |
| Docker is unavailable locally or in CI | Med | Opt-in `test:int`, not in the default gate |

## Rollback Plan

Revert the `fix(criteria)` commit and publish a patch. There is no data or schema impact, and the new devDependencies and script go with the revert.

## Dependencies

- Docker for `test:int` only.

## Success Criteria (issue #212)

- [ ] `LIKE` on date, timestamp, integer, and uuid columns executes without a PostgreSQL error (integration test).
- [ ] `LIKE` on text columns behaves as before for plain values (integration and unit tests).
- [ ] `%` and `_` in values match literally (integration and unit tests).
- [ ] The unit spec asserts the exact `CAST(... AS text) ILIKE ... ESCAPE '\'` SQL. `pnpm test` and coverage stay green without Docker.
- [ ] The README and the `criteria-filtering` spec document the new semantics.
