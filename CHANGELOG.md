# Changelog

All notable changes to this project will be documented in this file.
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

