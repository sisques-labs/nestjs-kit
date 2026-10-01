# Tasks: Fix LIKE Operator on Non-Text Columns

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 300-380 (about 20 prod, 110 unit tests, 150 integration, 50 docs; lockfile excluded) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR (fallback to 2 PRs if int suite exceeds budget: unit fix, then integration + docs) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Escape helper + translator fix (unit-proven) | PR 1 | `npx jest src/shared/infrastructure/database/typeorm/criteria` | N/A: unit mocks only | Revert helper, translator `LIKE` case, specs |
| 2 | Opt-in PG integration suite, deps, README | PR 1 (or PR 2) | `pnpm test:int` | Testcontainers `postgres:16-alpine` (needs Docker) | Revert `test/`, `test:int`, devDeps, README |

## Phase 1: Escape helper (strict TDD)

- [x] 1.1 RED: create `src/shared/infrastructure/database/typeorm/criteria/escape-like-pattern.spec.ts`: `'ros'`->`'ros'`, `'50%'`->`'50\%'`, `'a_b'`->`'a\_b'`, `'c:\x'`->`'c:\\x'`, mixed, empty string. Verify: fails.
- [x] 1.2 GREEN: create `src/shared/infrastructure/database/typeorm/criteria/escape-like-pattern.ts` (`replace(/[\\%_]/g, '\\$&')`); not exported from the typeorm entrypoint. Verify: 1.1 passes.

## Phase 2: Translator (strict TDD)

- [x] 2.1 RED: in `src/shared/infrastructure/database/typeorm/criteria/apply-criteria-to-query-builder.spec.ts` assert exact `andWhere("CAST(entity.name AS text) ILIKE :filter0 ESCAPE '\\'", { filter0: '%ros%' })`; rows: `'50%'`->`'%50\\%%'`, `'a_b'`, backslash, numeric value coerced via `String`.
- [x] 2.2 GREEN: in `.../typeorm/criteria/apply-criteria-to-query-builder.ts` change the `LIKE` case to use `CAST(${column} AS text) ILIKE :${param} ESCAPE '\\'` and `%${escapeLikePattern(String(value))}%`. Update JSDoc (cast, literal contains, index note).
- [x] 2.3 REFACTOR: confirm other operator rows unchanged; `npx jest src/shared/infrastructure/database/typeorm`.

## Phase 3: Integration suite (opt-in, Docker)

- [x] 3.1 `package.json`: add devDeps `@testcontainers/postgresql`, `pg` (+ `@types/pg` if needed); add `"test:int": "jest --config ./test/jest-int.json --runInBand"`. Do not touch `test`/`test:cov`.
- [x] 3.2 Create `test/jest-int.json` (rootDir `..`, testRegex `test/integration/.*\\.int-spec\\.ts$`, `@/` mapper, `testTimeout` 120000).
- [x] 3.3 Create `test/integration/criteria/like-probe.entity.ts` (`LikeProbe`: `bornOn`->`born_on` date, `createdAt` timestamptz, `quantity` int, `externalId` uuid, `name` text).
- [x] 3.4 RED: create `test/integration/criteria/apply-criteria-to-query-builder.int-spec.ts` (`beforeAll` container + `synchronize: true` + seed; `afterAll` destroy/stop). Cases: date `'2024-03'`, timestamptz `'2024-03-15'`, int `'42'`, uuid prefix, text `'ros'`, literal `'50%'` and `'a_b'` not matching `'500'`/`'axb'`; `getQuery()` contains `CAST("p"."born_on" AS text)`. Verify: `pnpm test:int`.
- [x] 3.5 SKIPPED (3.4 passed: TypeORM rewrites alias.prop inside CAST) CONDITIONAL (only if 3.4 fails on alias rewrite): fallback in the `LIKE` case using `qb.expressionMap.mainAlias.metadata.findColumnWithPropertyPath(field)?.databaseName` + `qb.escape`; update unit spec mocks (2.1) accordingly. Otherwise skip.
- [x] 3.6 Verify `pnpm test`, `pnpm test:cov` (80% gate), `pnpm build` exclude `test/` and still pass.

## Phase 4: Docs and spec sync

- [x] 4.1 `README.md` near line 722: document cast to text, literal contains and `%`/`_`/`\` escaping, index loss with `((col::text))` expression-index remedy, DateStyle (ISO default), `test:int`, and that verification covers TypeORM 1.x only (peer `>=0.3.0` kept).
- [x] 4.2 PR/release note (`fix(criteria)`): `%` and `_` are now literal.
- [x] 4.3 Archive note: when syncing the delta spec into `openspec/specs/criteria-filtering/spec.md`, remove the old "Database integration tests" Out of Scope bullet.
