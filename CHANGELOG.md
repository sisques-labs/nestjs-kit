# [1.4.0](https://github.com/sisques-labs/nestjs-kit/compare/v1.3.2...v1.4.0) (2026-07-16)


### Features

* **value-objects:** add MimeTypeValueObject and FilenameValueObject ([317e78c](https://github.com/sisques-labs/nestjs-kit/commit/317e78c2325219791e91d6e5b3d8e8e17ba4fcb4))

## [1.3.2](https://github.com/sisques-labs/nestjs-kit/compare/v1.3.1...v1.3.2) (2026-07-15)


### Bug Fixes

* **ci:** isolate PR concurrency group from main release group ([812b6bb](https://github.com/sisques-labs/nestjs-kit/commit/812b6bb311b7d9d665e86bb77a14ef1fe6928555))
* **ci:** run CI on pull requests to any base branch ([92da3d3](https://github.com/sisques-labs/nestjs-kit/commit/92da3d3077676408722161beeae9ced0c17a8124))

## [1.3.1](https://github.com/sisques-labs/nestjs-kit/compare/v1.3.0...v1.3.1) (2026-07-12)


### Bug Fixes

* **messaging:** make MessagingModule global, export EVENT_PUBLISHER/EVENT_CONSUMER ([f794fc7](https://github.com/sisques-labs/nestjs-kit/commit/f794fc73bb5a19352ac2f241c54d352baa59580e))

# [1.3.0](https://github.com/sisques-labs/nestjs-kit/compare/v1.2.1...v1.3.0) (2026-07-12)


### Features

* **messaging:** add Kafka consumer port and kafkajs adapter ([145425b](https://github.com/sisques-labs/nestjs-kit/commit/145425b43367cbf3f3d8345b692e22e53d3d7728))

## [1.2.1](https://github.com/sisques-labs/nestjs-kit/compare/v1.2.0...v1.2.1) (2026-07-10)


### Bug Fixes

* **mcp:** rename IMcpToolContext to IBaseMcpToolContext ([#9](https://github.com/sisques-labs/nestjs-kit/issues/9)) ([2a44744](https://github.com/sisques-labs/nestjs-kit/commit/2a44744e753b07ea7b9444e781e9e568bf23f2bd))

# [1.2.0](https://github.com/sisques-labs/nestjs-kit/compare/v1.1.1...v1.2.0) (2026-07-09)


### Features

* **metrics,messaging:** add shared modules under /metrics and /messaging ([4b991b8](https://github.com/sisques-labs/nestjs-kit/commit/4b991b8b4a2c0d67954337ebf67cef60d8c8aa44))

## [1.1.1](https://github.com/sisques-labs/nestjs-kit/compare/v1.1.0...v1.1.1) (2026-07-09)


### Bug Fixes

* **mcp:** stop tsc-alias from rewriting the MCP SDK's paths alias ([509044c](https://github.com/sisques-labs/nestjs-kit/commit/509044c2273820eeaafa80f76e4594db7eecb942))

# [1.1.0](https://github.com/sisques-labs/nestjs-kit/compare/v1.0.0...v1.1.0) (2026-07-09)


### Features

* **mcp:** add shared MCP module under /mcp subpath ([2322fe4](https://github.com/sisques-labs/nestjs-kit/commit/2322fe4b28ab746b05fc618bb6dc5e81bc556881))

# [1.0.0](https://github.com/sisques-labs/nestjs-kit/compare/v0.11.2...v1.0.0) (2026-07-08)


* feat(exports)!: split MongoDB/TypeORM/GraphQL/Kafka into subpath exports ([6015171](https://github.com/sisques-labs/nestjs-kit/commit/60151714f22a2f5b5671bd1a0db3dfaed38112a0))


### Bug Fixes

* **ci:** drop hardcoded pnpm version, rely on packageManager ([943ff40](https://github.com/sisques-labs/nestjs-kit/commit/943ff40f7a84fc91ab600f065a8d7510c679793b))
* **ci:** pin packageManager so pnpm/action-setup can auto-detect ([b7e67a0](https://github.com/sisques-labs/nestjs-kit/commit/b7e67a01c8eedccbf80f0fc53409cdd1fde5a537))


### BREAKING CHANGES

* MongoDB, TypeORM, GraphQL, and Kafka symbols previously
exported from the package root must now be imported from their matching
subpath (see README's "Entry Points / Subpath Exports" section).

Also automates releases: pushes to main now run semantic-release (via
sisques-labs/workflows' node-release.yml) instead of a manual
workflow_dispatch release, replacing the git-cliff based flow.

# Changelog

All notable changes to this project will be documented in this file.
## [0.11.2] - 2026-07-03

### Features
- **criteria:** Add applyCriteriaToQueryBuilder TypeORM helper (1412565)
## [0.11.1] - 2026-07-02

### Bug Fixes
- **criteria:** Mark generated filter/sort input classes as abstract (b10f8ba)
## [0.11.0] - 2026-07-02

### Features
- **criteria:** Type-safe filter field enum and validated JSON value (232ceec)
## [0.10.2] - 2026-05-28

### Features
- Implement buildTypeOrmOrder method in BaseDatabaseRepository (1f7dbf0)

### Refactor
- Use SortDirection enum in BaseDatabaseRepository tests (67ed3bf)
## [0.10.1] - 2026-05-25

### Bug Fixes
- Format expectation in BaseTypeOrmMapper test for clarity (6b2cd73)

### Features
- Enhance database mappers and add new module exports (6fa29de)
## [0.10.0] - 2026-05-24

### Chore
- Update release workflow and add changelog generation (b2463dd)

### Features
- Add touch method to BaseAggregate for updating timestamp (1b3ce62)
## [0.9.0] - 2026-05-24

### Chore
- Apply eslint formatting to BaseBuilder files (ec73103)

### Features
- Add BaseBuilder with shared id and timestamp validation (4c72221)
## [0.8.1] - 2026-05-24

### Chore
- Add field is required exception to index (52b9927)
## [0.8.0] - 2026-05-24

### Chore
- Add field is required exception (0850459)
## [0.7.3] - 2026-05-24

### Features
- Add id field to BasePrimitives type for enhanced entity identification (fd236d0)

### Refactor
- Simplify constructor parameters in BaseViewModel for improved clarity (d649b93)
## [0.7.1] - 2026-05-01

### Chore
- Update peerDependencies and add new dependencies for improved functionality (5ca3716)
- Update pnpm-lock.yaml to remove deprecated dependencies and add new ones for better compatibility (8442b41)

### Features
- Enhance BaseFindByCriteriaInput with Type decorators for filters, sorts, and pagination (3586076)

### Refactor
- Reorder imports in BaseFindByCriteriaInput for improved readability (cca3f75)
## [0.7.0] - 2026-04-30

### Chore
- New schema registry support and event metadata enhancements (30ab933)
## [0.6.0] - 2026-04-12

### Features
- Add Kafka event publisher interface export to index.ts (f6056fa)
## [0.5.3] - 2026-04-11

### Features
- Add exports field in package.json to define module entry points for require and import (cf73700)
## [0.5.2] - 2026-04-11

### Bug Fixes
- Add environment variable checks for MONGODB_URI and MONGODB_DATABASE in MongoService to prevent connection errors (5eaa16e)
## [0.5.1] - 2026-04-11

### Bug Fixes
- Update createSharedWinstonLoggerOptions to conditionally set exception and rejection handlers, preventing Winston warnings (c1c1a24)
## [0.5.0] - 2026-04-11

### Features
- Add BaseGraphQLMapper for transforming domain view models to GraphQL response DTOs and include unit tests (86a405e)
## [0.4.2] - 2026-04-11

### Features
- Extend BaseMongoDBMapper to support mapping from aggregates and enhance date handling in tests (d931695)
## [0.4.1] - 2026-04-11

### Features
- Enhance build process with tsc-alias and update README for BaseMongoMasterRepository usage (ba893eb)
- Implement caching mechanism in BaseMongoMasterRepository for improved performance (a2b728c)

### Refactor
- Rename MongoMasterService to MongoService and update related repository classes for consistency (a86239e)
## [0.4.0] - 2026-04-11

### Features
- Add base-mongodb.mapper to index for improved MongoDB data mapping (694b58b)
## [0.3.1] - 2026-04-11

### Bug Fixes
- Update import path for PaginatedResult in base-write-repository.interface.ts to ensure correct module resolution (810c183)

### Features
- Add findByCriteria method to IBaseWriteRepository for enhanced entity retrieval based on criteria (9294c35)
## [0.3.0] - 2026-04-11

### Features
- Add find-by-criteria-query.dto and find-by-id-query.dto to index for improved query handling (0c3b866)
## [0.2.0] - 2026-04-11

### Features
- Add delete-command.dto and update-command.dto to index for enhanced command handling (eb22d59)
## [0.1.1] - 2026-04-10

### Documentation
- Update README.md to reflect changes in module usage, clarify optional imports, and introduce new GraphQL enum registration; remove SharedModule for improved modularity (3b8b52b)
## [0.1.0] - 2026-04-10

### Chore
- First commit (88709d4)
- Update project configuration and dependencies, remove unused files (9c33ecf)
- Add publishing configuration and update README for GitHub Packages (93fc676)
- Update ESLint configuration and refactor code style across multiple files (6830c1a)
- Migrate publishing configuration from GitHub Packages to npm registry and update workflows accordingly (c5bc638)
- Enhance release workflow to support pre-release versions and add release type input (85ff435)
- Update package.json and pnpm-lock.yaml to include husky and improve linting scripts (c504bfb)
- Update dependencies and enhance logging documentation with Winston integration (c8bf942)
- Update pre-commit hook to include build step before testing (90e24b7)
- Update README.md to enhance documentation on CI workflows, publishing process, and installation instructions (4b24cc8)
- Remove nest-winston dependency and module, update logging documentation for clarity and configuration options (0b60cd3)
- Downgrade version to 0.0.0, update README.md for winston-daily-rotate-file integration, and enhance logger options factory with error handling for missing transport (b4d2a0b)

### Documentation
- Enhance README with detailed GitHub Actions workflows for CI and Release (4c9f97b)
- Update README to reflect changes in authentication method and modify .npmrc to use NODE_AUTH_TOKEN (5b060e6)
- Update README.md to clarify module usage for MongoDB and TypeORM, including environment variable requirements and optional imports; refactor TypeORM and MongoDB modules for better integration (9c1a6cd)
- Enhance documentation for BaseDatabaseRepository, BaseTypeormDto, and BaseTypeormEntity with detailed descriptions and examples for better clarity and usability (499b68b)

### Features
- Enhance NumberValueObject with detailed validation and parsing methods (3e05da6)
- Enhance NumericRangeValueObject with comprehensive documentation and validation logic (616cb62)

### Refactor
- Implement base ValueObject class for value objects and update existing value objects to extend from it (9d9fe47)
- Improve documentation and method descriptions in ValueObject base class (49d6d94)
- Enhance documentation and validation in Boolean, Color, and Date value objects (847dff2)
- Reorganize exports in index.ts for better structure and clarity (bcbd25f)
- Expand documentation and implement composite value object handling in ValueObject base class (9529795)
- Rename package from @sisques-labs/shared-nestjs to @sisques-labs/nestjs-kit and update related documentation for consistency (bbb11cf)
