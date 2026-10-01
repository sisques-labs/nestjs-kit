# Exploration: fix-like-operator-non-text-columns

Source: Engram `sdd/fix-like-operator-non-text-columns/explore` (issue #212: `LIKE` fails on non-text columns).

## Problem

PostgreSQL raises `operator does not exist: date ~~* unknown` when a `LIKE` filter targets a non-text column (date, timestamp, integer, uuid).

## Affected

- `src/shared/infrastructure/database/typeorm/criteria/apply-criteria-to-query-builder.ts` (lines 82-86): `LIKE` emits `${alias}.${field} ILIKE :filterN` with `%value%`. There is no cast and no escaping.
- `apply-criteria-to-query-builder.spec.ts`: Jest mock query builder that asserts the exact SQL string (around lines 106-116).
- `FilterOperator` has 10 members. There is no `NOT_LIKE`.
- Mongo `buildMongoQuery` (`base-mongo-database.repository.ts:47`) uses an unescaped `$regex`. That is a separate regex-semantics issue.

## Test infrastructure

- There are no `pg`, testcontainers, pg-mem, or sqlite devDependencies.
- Jest uses `rootDir=src` and `testRegex .spec.ts`. `test/` contains only the default Nest `app.e2e-spec.ts`.
- CI delegates to `sisques-labs/workflows` `node-ci.yml` with `test:cov`. No database service is known to run there.
- The `criteria-filtering` spec lists database integration tests as out of scope.

## Learned

- Recommended: `CAST(col AS text) ILIKE :p` for every `LIKE`. This keeps a single code path, and a text-to-text cast is a no-op. Also escape `\`, `%`, `_` in the value. The PostgreSQL default escape character is backslash, and an explicit `ESCAPE '\'` can be added.
- Open decisions (confirmed later): wildcard escaping is a behavior change, cast only non-text columns (not knowable without metadata), real-PostgreSQL test infrastructure, and Mongo regex escaping parity.
- Risks:
  - TypeORM must still replace the property name inside `CAST(...)`; this needs verification on `typeorm ^1.0.0`.
  - `CAST` prevents btree and pg_trgm index use unless an expression index exists.
  - The text format of dates depends on `DateStyle`.
