# Design: Fix LIKE Operator on Non-Text Columns

## Technical Approach

`FilterOperator.LIKE` gets one code path in the TypeORM translator. The column is always cast to text, and the value is escaped so it is a literal "contains" pattern. A pure helper owns the escaping. A new opt-in testcontainers suite under `test/integration/` runs the real SQL against PostgreSQL. It stays outside `rootDir=src`, so `pnpm test`, `test:cov`, the coverage gate, and `nest build` never see it. Implements `specs/criteria-filtering/spec.md` (delta).

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|---|---|---|---|
| SQL form | `` `CAST(${column} AS text) ILIKE :${param} ESCAPE '\\'` `` (TS source), which renders as `CAST(entity.name AS text) ILIKE :filter0 ESCAPE '\'` | `::text`; no `ESCAPE` clause | TypeORM's rewrite regex needs `[ =(]` before `alias.prop` and `[ =),]` after it. `alias.prop::text` would capture `prop::text` as the property, and the rewrite would fail. `CAST(alias.prop AS text)` satisfies both sides. An explicit `ESCAPE` does not depend on the server default. `'\'` is valid under `standard_conforming_strings=on` (the default since PG 9.1). |
| Escape helper | `escapeLikePattern(value: string): string` in `.../typeorm/criteria/escape-like-pattern.ts`. It does `String(value).replace(/[\\%_]/g, '\\$&')`, and the caller wraps the result in `%...%`. | Inline in `applyFilter`; export from the `typeorm` entrypoint | Pure and unit-testable on its own. Not exported publicly: the entrypoint only re-exports `apply-criteria-to-query-builder`, so the public surface does not grow. |
| Non-string values | `String(filter.value)` before escaping | Reject non-strings | Matches the current template-literal coercion (`%${value}%`), so `LIKE 42` keeps working. |
| `alias.prop` inside `CAST` | Rely on TypeORM's rewrite | Resolve `databaseName` ourselves | Verified in `node_modules/typeorm@1.1.0` `QueryBuilder.replacePropertyNamesForTheWholeQuery`. The regex `([ =(]\|^)(alias\.)([^ =(),]+)(?=[ =),]\|$)` matches `(entity.bornOn ` and rewrites it to `"entity"."born_on"`. The integration test asserts this. |
| Fallback if the rewrite fails | `qb.expressionMap.mainAlias.metadata.findColumnWithPropertyPath(field)?.databaseName` plus `qb.escape(alias)` / `qb.escape(dbName)`, used only for `LIKE`, and only if the integration test fails | Use it always | It adds metadata coupling and changes the unit-mock contract. Kept as a documented contingency. |
| Integration location | `test/integration/**/*.int-spec.ts` with `test/jest-int.json` | Co-locate `*.int-spec.ts` in `src/` | With co-location, root `collectCoverageFrom: **/*.(t\|j)s` would count the int-spec as uncovered source, because it does not match `testRegex`, and the coverage gate would drop. `test/` already holds `jest-e2e.json`, and `tsconfig.build.json` excludes `test`. |
| TypeORM peer range | Keep `>=0.3.0`. Test only against the installed 1.x. | Narrow to `>=1.0.0`; matrix-test 0.3.x | `CAST(...)`, `ILIKE`, and `ESCAPE` are plain SQL. The `[ =(]` prefix rewrite also exists in 0.3.x `replacePropertyNamesForTheWholeQuery`, but that is unverified here. Narrowing a peer range in a patch release would be a breaking change. A 0.3.x matrix is out of scope; see Open Questions. |

## Data Flow

    Filter{LIKE, value} ──> applyFilter
        ├─ escapeLikePattern(String(value)) ──> `%${escaped}%` ──> :filterN
        └─ andWhere("CAST(alias.field AS text) ILIKE :filterN ESCAPE '\'")
              └─ TypeORM getQuery(): alias.field ──> "alias"."db_column"

## File Changes

| File | Action | Description |
|---|---|---|
| `src/shared/infrastructure/database/typeorm/criteria/escape-like-pattern.ts` | Create | Pure escape helper |
| `src/shared/infrastructure/database/typeorm/criteria/escape-like-pattern.spec.ts` | Create | Helper unit cases |
| `src/shared/infrastructure/database/typeorm/criteria/apply-criteria-to-query-builder.ts` | Modify | `LIKE` case; JSDoc covering cast, literal semantics, and index note |
| `src/shared/infrastructure/database/typeorm/criteria/apply-criteria-to-query-builder.spec.ts` | Modify | Exact-SQL assertion and escaping rows |
| `test/jest-int.json` | Create | Integration jest config |
| `test/integration/criteria/like-probe.entity.ts` | Create | Fixture entity |
| `test/integration/criteria/apply-criteria-to-query-builder.int-spec.ts` | Create | Testcontainers suite |
| `package.json` | Modify | `test:int` script; devDeps `@testcontainers/postgresql`, `pg` |
| `README.md` | Modify | `LIKE` semantics near the TypeORM translator section (around line 722); line 631 Mongo row unchanged |

## Interfaces / Contracts

```json
// test/jest-int.json
{ "moduleFileExtensions": ["js","json","ts"], "rootDir": "..",
  "testRegex": "test/integration/.*\\.int-spec\\.ts$", "testEnvironment": "node",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "moduleNameMapper": { "^@/(.*)$": "<rootDir>/src/$1" }, "testTimeout": 120000 }
```

`"test:int": "jest --config ./test/jest-int.json --runInBand"`

The fixture `LikeProbe` (table `like_probe`) deliberately uses property names that differ from the column names, to prove the rewrite:
- `id` uuid PK
- `name` text
- `bornOn` date → `born_on`
- `createdAt` timestamptz → `created_at`
- `quantity` integer
- `externalId` uuid → `external_id`

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit | Helper | `'ros'`→`'ros'`; `'50%'`→`'50\%'`; `'a_b'`→`'a\_b'`; `'c:\x'`→`'c:\\x'`; mixed; empty string; number → string |
| Unit | Translator | `andWhere` called with `"CAST(entity.name AS text) ILIKE :filter0 ESCAPE '\\'"` and `{ filter0: '%ros%' }`; `'50%'` gives `'%50\\%%'` |
| Integration | Real PG | `beforeAll`: `new PostgreSqlContainer('postgres:16-alpine').start()`, then `DataSource({ type: 'postgres', url, entities: [LikeProbe], synchronize: true })`, then seed. `afterAll`: `dataSource.destroy()`, then `container.stop()`. Cases: date `'2024-03'`, timestamptz `'2024-03-15'` (ISO fragments only; the container's default DateStyle is ISO), integer `'42'`, uuid prefix, text regression `'ros'`, literal `'50%'` and `'a_b'` must not match `'500'` / `'axb'`. Also asserts `qb.getQuery()` contains `CAST("p"."born_on" AS text)`. |

The integration suite is not part of `pnpm test` or CI wiring, and it needs Docker.

## Threat Matrix

N/A: no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. User input stays parameter-bound, and escaping only narrows pattern semantics.

## Migration / Rollout

No migration. Patch release via `fix(criteria)`. The changelog notes that `%` and `_` are now literal, and the README notes that `CAST` bypasses plain btree and pg_trgm indexes, with a `((col::text))` expression index as the remedy.

## Open Questions

- [ ] Whether to open a follow-up issue for a TypeORM 0.3.x compatibility matrix in `test:int`. This is non-blocking.
