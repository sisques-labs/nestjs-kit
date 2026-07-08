# @sisques-labs/nestjs-kit

**NestJS Kit** — a shared NestJS library providing **Domain-Driven Design (DDD)** and **CQRS** building blocks, **validated value objects**, **repository abstractions**, optional **MongoDB** and **TypeORM** helpers, **GraphQL** DTOs and plugins, and optional **Winston logger configuration** (for use with `nest-winston` in consuming apps) for microservices and modular monoliths.

## Table of Contents

- [Publishing](#publishing)
  - [CI](#ci)
  - [Release](#release)
  - [Publish from your machine](#publish-from-your-machine)
- [Installation](#installation)
- [Peer Dependencies](#peer-dependencies)
  - [Entry Points / Subpath Exports](#entry-points--subpath-exports)
- [Local development](#local-development)
- [Module Setup](#module-setup)
- [Domain Layer](#domain-layer)
  - [Base Aggregate](#base-aggregate)
  - [Value Objects](#value-objects)
  - [Aggregate and entity IDs](#aggregate-and-entity-ids)
  - [Domain Exceptions](#domain-exceptions)
  - [Criteria & Pagination](#criteria--pagination)
  - [Repository Interfaces](#repository-interfaces)
  - [Factory Interfaces](#factory-interfaces)
  - [View Models](#view-models)
  - [Domain Events](#domain-events)
- [Application Layer](#application-layer)
  - [Command Handlers](#command-handlers)
  - [Service Interface](#service-interface)
- [Infrastructure Layer](#infrastructure-layer)
  - [Logging (Winston)](#logging-winston)
  - [MongoDB](#mongodb)
  - [TypeORM](#typeorm)
- [Transport Layer (GraphQL)](#transport-layer-graphql)
  - [Input DTOs](#input-dtos)
  - [Response DTOs](#response-dtos)
  - [Mappers](#mappers)
  - [Complexity Plugin](#complexity-plugin)
- [Enums](#enums)

---

## Publishing

The package is published to the public npm registry as [`@sisques-labs/nestjs-kit`](https://www.npmjs.com/package/@sisques-labs/nestjs-kit) (see `publishConfig` in `package.json`). Releases are fully automated with GitHub Actions — there is no manual release step.

| Workflow | File | Trigger |
|---|---|---|
| **CI** | `.github/workflows/ci.yml` (`ci` job) | Push and pull requests targeting `main` |
| **Release** | `.github/workflows/ci.yml` (`release` job) | Push to `main`, after `ci` passes |

### CI

Runs `pnpm install --frozen-lockfile`, **`pnpm lint`** (ESLint with `--fix`), **`pnpm build`**, and **`pnpm test`**.

### Release

Every push to `main` that passes the `ci` job triggers the `release` job, which calls the shared [`node-release.yml`](https://github.com/sisques-labs/workflows/blob/main/.github/workflows/node-release.yml) reusable workflow from `sisques-labs/workflows`. That workflow runs [`semantic-release`](https://semantic-release.gitbook.io/) (config in `.releaserc.json`), which:

- Determines the version bump from [Conventional Commits](https://www.conventionalcommits.org/) since the last release (`fix:` → patch, `feat:` → minor, `!`/`BREAKING CHANGE:` → major).
- Skips the release entirely if nothing since the last tag warrants one.
- Updates `CHANGELOG.md`, publishes to npm with **`pnpm publish`** using the **`NPM_TOKEN`** repository secret, commits the version bump, tags the release (`vX.Y.Z`), and creates a GitHub Release with generated notes.

**Repository setup:** add an [npm automation token](https://docs.npmjs.com/creating-and-viewing-access-tokens) with publish rights as the **`NPM_TOKEN`** secret (GitHub → Settings → Secrets and variables → Actions). No manual `workflow_dispatch` step or version input is needed — just merge conventional-commit PRs into `main`.

### Publish from your machine

Not recommended — versioning and the changelog are owned by `semantic-release` based on commit history on `main`, so a manual `pnpm publish` will drift from the git tags. Merge conventional-commit PRs into `main` instead and let the `release` job publish.

---

## Installation

The package is **public** on npm; a normal install is enough:

```bash
pnpm add @sisques-labs/nestjs-kit
# or: npm install / yarn add @sisques-labs/nestjs-kit
```

Use your organization’s registry or mirror policy if applicable.

If you previously used **`@sisques-labs/shared-nestjs`**, uninstall it and depend on **`@sisques-labs/nestjs-kit`** instead; replace every import path from `'@sisques-labs/shared-nestjs'` to `'@sisques-labs/nestjs-kit'` (API unchanged).

---

## Peer Dependencies

Install only what your app uses. Peers marked **optional** in `peerDependenciesMeta` can be omitted if you do not import that part of the library — and thanks to the [subpath exports](#entry-points--subpath-exports) below, importing from the package root never pulls in code that requires them, so an unused optional peer is never even loaded, let alone required at install time.

```bash
# Core NestJS (required for any integration)
pnpm add @nestjs/common @nestjs/core reflect-metadata rxjs

# CQRS (command handlers, EventBus)
pnpm add @nestjs/cqrs

# MongoDB module + repositories — only if you import '@sisques-labs/nestjs-kit/mongodb'
pnpm add mongodb @nestjs/config

# TypeORM module + repositories — only if you import '@sisques-labs/nestjs-kit/typeorm'
pnpm add typeorm @nestjs/typeorm @nestjs/config

# GraphQL DTOs, Apollo, complexity plugin — only if you import '@sisques-labs/nestjs-kit/graphql'
pnpm add graphql @nestjs/graphql @nestjs/apollo @apollo/server graphql-query-complexity graphql-type-json

# Kafka event publishing / schema registry — only if you import '@sisques-labs/nestjs-kit/kafka'
pnpm add @kafkajs/confluent-schema-registry @nestjs/axios

# class-validator / class-transformer (typical for GraphQL inputs)
pnpm add class-validator class-transformer

# Winston logging (shared config + nest-winston in your app)
pnpm add nest-winston winston winston-daily-rotate-file
```

### Entry Points / Subpath Exports

The package has dedicated entry points so importing the root never requires an optional peer you don't use:

| Import | Requires |
|---|---|
| `@sisques-labs/nestjs-kit` | Core only (`@nestjs/cqrs`, `class-validator`, `class-transformer`, `winston`, ...) — safe to import with nothing else installed |
| `@sisques-labs/nestjs-kit/mongodb` | `mongodb`, `@nestjs/config` |
| `@sisques-labs/nestjs-kit/typeorm` | `typeorm`, `@nestjs/typeorm`, `@nestjs/config` |
| `@sisques-labs/nestjs-kit/graphql` | `graphql`, `@nestjs/graphql`, `@nestjs/apollo`, `@apollo/server`, `graphql-query-complexity`, `graphql-type-json` |
| `@sisques-labs/nestjs-kit/kafka` | `@kafkajs/confluent-schema-registry`, `@nestjs/axios` |
| `@sisques-labs/nestjs-kit/registered-enums` | Nothing extra — narrow export of the GraphQL enum registration for use before schema generation |

> **Migrating from an earlier version?** MongoDB, TypeORM, GraphQL, and Kafka symbols used to be exported from the package root. Move those specific imports to the matching subpath above; everything else (value objects, base classes, domain enums, exceptions) still imports from `@sisques-labs/nestjs-kit` unchanged.

---

## Local development

For contributors working on this repository:

| Script | Description |
|---|---|
| `pnpm install` | Installs dependencies; **`prepare`** runs Husky and **`pnpm build`**. |
| `pnpm build` | Compiles TypeScript to `dist/` (`nest build`). |
| `pnpm lint` | ESLint with `--fix` on `src`, `apps`, `libs`, `test`. |
| `pnpm lint:check` | ESLint without autofix (used by **Husky pre-commit**). |
| `pnpm test` | Jest unit tests (`*.spec.ts` under `src/`). |
| `pnpm test:cov` | Tests with coverage. |
| `pnpm format` | Prettier on `src` and `test` TypeScript. |

**Git hooks:** [Husky](https://typicode.github.io/husky/) runs **`pnpm lint:check`** and **`pnpm test`** on **pre-commit** (see `.husky/pre-commit`). To skip hooks for a one-off commit: `HUSKY=0 git commit ...`.

---


## Module Setup

The library is **opt-in by feature**. Import **`MongoModule`**, **`TypeOrmModule`**, GraphQL pieces (DTOs, **`registerSharedGraphqlEnums`**, mappers, plugins), and domain exports only when you need them.

**`SharedModule`** is an optional **empty** `Module` kept for backward compatibility; it registers **no** providers and is **not** `@Global()`.

**Optional database modules:**

- **`MongoModule`** — provides `MongoService` (`MONGODB_URI`, `MONGODB_DATABASE` via `ConfigService`).
- **`TypeOrmModule`** — registers `TypeOrmModule.forRootAsync` using `DATABASE_*` config; requires **`ConfigModule`** in the app (for example `ConfigModule.forRoot({ isGlobal: true })`).

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from '@sisques-labs/nestjs-kit/mongodb';
import { TypeOrmModule } from '@sisques-labs/nestjs-kit/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongoModule, // omit if you do not use MongoDB
    TypeOrmModule, // omit if you do not use TypeORM
  ],
})
export class AppModule {}
```

**Logging is separate:** this library does **not** register `WinstonModule`. Import **`WinstonModule`** from `nest-winston` in your app and pass **`createSharedWinstonLoggerOptions()`** or **`defaultSharedWinstonLoggerOptions`**—see [Logging (Winston)](#logging-winston).

---

## Domain Layer

### Base Aggregate

`BaseAggregate` extends `@nestjs/cqrs` **`AggregateRoot`** and wires **`createdAt`** and **`updatedAt`** as `DateValueObject` properties. Add identity and domain fields in your subclass (for example a `UuidValueObject` or app-specific id type).

```typescript
import {
  BaseAggregate,
  DateValueObject,
  EmailValueObject,
  UuidValueObject,
} from '@sisques-labs/nestjs-kit';

export class UserAggregate extends BaseAggregate {
  constructor(
    private readonly _id: UuidValueObject,
    private _email: EmailValueObject,
    createdAt: DateValueObject,
    updatedAt: DateValueObject,
  ) {
    super(createdAt, updatedAt);
  }

  get id(): UuidValueObject {
    return this._id;
  }
}
```

Use `apply()`, `commit()`, and related `AggregateRoot` APIs for domain events as usual.

---

### Value Objects

All value objects are immutable and validate their input on construction, throwing a typed domain exception on invalid data.

#### Basic Scalars

| Class | Description |
|---|---|
| `StringValueObject` | String with optional min/max length, pattern, and trim |
| `NumberValueObject` | Numeric value with validation |
| `BooleanValueObject` | Boolean wrapper |
| `DateValueObject` | Date wrapper |
| `JsonValueObject` | Valid JSON value |
| `EnumValueObject<T>` | Typed enum wrapper |

#### Format-Specific

| Class | Description |
|---|---|
| `EmailValueObject` | RFC 5322 compliant. Methods: `getLocalPart()`, `getDomain()` |
| `UuidValueObject` | RFC 4122. Methods: `getVersion()`, `isNil()`, static `generate()` |
| `PhoneValueObject` | E.164 format. Methods: `getCountryCode()`, `toE164()` |
| `UrlValueObject` | Valid URL |
| `IpValueObject` | IPv4/IPv6 validation |
| `HexValueObject` | Hexadecimal string |
| `ColorValueObject` | Hex, RGB, HSL, and named colors with conversion methods |
| `SlugValueObject` | URL-friendly slug. Methods: `toHumanReadable()`, `addPrefix()`, `addSuffix()`, static `generateSlug()` |
| `PasswordValueObject` | Strength scoring, common password detection. Methods: `getStrengthScore()`, `meetsRequirements()` |
| `LocaleValueObject` | BCP 47 locale (50+ supported). Methods: `getLanguageCode()`, `getCountryCode()`, `getDisplayName()` |
| `TimezoneValueObject` | IANA timezone |
| `PhoneCodeValueObject` | Phone dial code |
| `LengthUnitValueObject` | Unit of length measurement |
| `DimensionsValueObject` | Length, width, height with unit and optional bounds |
| `NumericRangeValueObject` | Min/max numeric range |

**Usage example:**

```typescript
import {
  EmailValueObject,
  UuidValueObject,
  PasswordValueObject,
} from '@sisques-labs/nestjs-kit';

const email = new EmailValueObject('user@example.com');
console.log(email.getDomain()); // 'example.com'

const id = UuidValueObject.generate();
console.log(id.getVersion()); // 4

const password = new PasswordValueObject('MyS3cur3P@ss!');
console.log(password.getStrengthScore()); // number 0-5
console.log(password.meetsRequirements()); // boolean
```

Many value objects also have a **folder-level `README.md`** under `src/shared/domain/value-objects/<name>/` with API tables and examples.

---

### Aggregate and entity IDs

The library exports **`UuidValueObject`** for validated RFC 4122 UUID strings (construction, `generate()`, `getVersion()`, `isNil()`, etc.).

For **aggregate- or entity-specific** identifiers (nominal typing per bounded context), define thin subclasses or wrappers **in your application**, for example:

```typescript
import { UuidValueObject } from '@sisques-labs/nestjs-kit';

export class UserId extends UuidValueObject {
  // optional: narrow type or factory methods for your domain
}
```

---

### Domain Exceptions

`BaseException` is the root exception class. Each value object has a corresponding typed exception thrown on validation failure.

```typescript
import { BaseException } from '@sisques-labs/nestjs-kit';

// BaseException provides:
// - timestamp: Date
// - getDetailedMessage(): string  → "[ClassName]: message"
// - toJSON(): object
```

Available typed exceptions (all extend `BaseException`):

`InvalidBooleanException`, `InvalidColorException`, `InvalidDimensionsException`, `InvalidEmailException`, `InvalidEnumValueException`, `InvalidHexException`, `InvalidIpException`, `InvalidJsonException`, `InvalidLocaleException`, `InvalidNumberException`, `InvalidNumericRangeException`, `InvalidPasswordException`, `InvalidPhoneException`, `InvalidStringException`, `InvalidTimezoneException`, `InvalidUrlException`, `InvalidUuidException`

---

### Criteria & Pagination

Use `Criteria` to build type-safe query parameters with filters, sorts, and pagination.

```typescript
import {
  Criteria,
  FilterOperator,
  SortDirection,
} from '@sisques-labs/nestjs-kit';

const criteria = new Criteria(
  [{ field: 'email', operator: FilterOperator.EQUALS, value: 'user@example.com' }],
  [{ field: 'createdAt', direction: SortDirection.DESC }],
  { page: 1, perPage: 20 },
);
```

`PaginatedResult<T>` wraps paginated query results:

```typescript
import { PaginatedResult } from '@sisques-labs/nestjs-kit';

// { data: T[], total: number, page: number, perPage: number }
const result: PaginatedResult<User> = await repository.findByCriteria(criteria);
```

---

### Repository Interfaces

Implement these interfaces in your infrastructure layer to keep the domain free of database concerns.

```typescript
import {
  IBaseReadRepository,
  IBaseWriteRepository,
} from '@sisques-labs/nestjs-kit';

// Read side: findById, findByCriteria, save, delete
interface IUserReadRepository extends IBaseReadRepository<UserAggregate> {}

// Write side: findById, save, delete
interface IUserWriteRepository extends IBaseWriteRepository<UserAggregate> {}
```

---

### Factory Interfaces

Factories handle deserialization of aggregates from different sources.

```typescript
import { IReadFactory, IWriteFactory } from '@sisques-labs/nestjs-kit';

// Read factory: creates view models from aggregates, DTOs, or primitives
class UserReadFactory implements IReadFactory<UserViewModel, UserAggregate, UserDto> {
  create(data: UserDto): UserViewModel { ... }
  fromAggregate(aggregate: UserAggregate): UserViewModel { ... }
  fromPrimitives(primitives: object): UserViewModel { ... }
}

// Write factory: creates aggregates from commands or primitives
class UserWriteFactory implements IWriteFactory<UserAggregate, CreateUserCommand, UserPrimitives> {
  create(command: CreateUserCommand): UserAggregate { ... }
  fromPrimitives(primitives: UserPrimitives): UserAggregate { ... }
}
```

---

### View Models

`BaseViewModel` provides a base for read-side projections with typed accessors for `id`, `createdAt`, and `updatedAt`.

```typescript
import { BaseViewModel } from '@sisques-labs/nestjs-kit';

export class UserViewModel extends BaseViewModel {
  // Inherited: getId(), getCreatedAt(), getUpdatedAt()
}
```

---

### Domain Events

`IBaseEventData` and `IEventMetadata` provide a structured shape for domain events with aggregate and entity metadata.

```typescript
import { IBaseEventData, IEventMetadata } from '@sisques-labs/nestjs-kit';

// IEventMetadata shape:
// {
//   aggregateRootId: string;
//   aggregateRootType: string;
//   entityId: string;
//   entityType: string;
//   eventType: string;
// }
```

---

## Application Layer

### Command Handlers

`BaseCommandHandler` integrates the `EventBus` to publish domain events automatically after command execution.

```typescript
import { BaseCommandHandler } from '@sisques-labs/nestjs-kit';
import { CommandHandler, EventBus } from '@nestjs/cqrs';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler extends BaseCommandHandler<CreateUserCommand> {
  constructor(
    private readonly repository: IUserWriteRepository,
    eventBus: EventBus,
  ) {
    super(eventBus);
  }

  async execute(command: CreateUserCommand): Promise<void> {
    const user = UserWriteFactory.create(command);
    await this.repository.save(user);
    this.publishEvents(user); // publishes domain events from the aggregate
  }
}
```

`BaseUpdateCommandHandler` adds utilities to extract changed fields from update commands, useful for partial updates.

---

### Service Interface

`IBaseService` is a marker interface for application services.

```typescript
import { IBaseService } from '@sisques-labs/nestjs-kit';

@Injectable()
export class UserService implements IBaseService {}
```

---

## Infrastructure Layer

### Logging (Winston)

Optional **Winston `LoggerOptions`** (JSON file rotation + console formats) for use with **`WinstonModule.forRoot`** from **`nest-winston`** in the consuming app. Install `nest-winston`, `winston`, and `winston-daily-rotate-file` there; this package lists `winston` and `winston-daily-rotate-file` as optional peers.

**Main exports:** `createSharedWinstonLoggerOptions`, `defaultSharedWinstonLoggerOptions`, `mergeSharedWinstonLoggerOptions`, `createSharedJsonLogFormat`, `createSharedConsoleLogFormat`, and `SharedWinstonLoggerFactoryOptions`.

**Full guide:** [src/shared/infrastructure/logging/README.md](src/shared/infrastructure/logging/README.md)

---

### MongoDB

Import **`MongoModule`** from this package when you use MongoDB repositories. It is **not** part of **`SharedModule`**.

#### Environment Variables

The shared `MongoService` reads:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=my_database
```

#### Base Repository

Extend **`BaseMongoDatabaseRepository`** (do not only `implements IBaseReadRepository`) so **`this`** includes **`MongoService`**, **`getCollection`**, **`buildMongoQuery`**, **`buildSortQuery`**, **`executeQueryWithPagination`**, and **`calculatePagination`** from **`BaseDatabaseRepository`**.

Published **`dist/**/*.d.ts`** use **relative** imports (rewritten at build with **`tsc-alias`**), so consumers do not need the kit’s `@/` path aliases to resolve inherited types.

```typescript
import { BaseMongoDatabaseRepository, MongoService } from '@sisques-labs/nestjs-kit/mongodb';
import { Criteria, PaginatedResult } from '@sisques-labs/nestjs-kit';

@Injectable()
export class UserMongoReadRepository extends BaseMongoDatabaseRepository {
  private static readonly COLLECTION = 'users';

  constructor(mongoService: MongoService) {
    super(mongoService);
  }

  async findByCriteria(
    criteria: Criteria,
  ): Promise<PaginatedResult<UserViewModel>> {
    const collection = this.getCollection(UserMongoReadRepository.COLLECTION);
    const mongoQuery = this.buildMongoQuery(criteria);
    const sortQuery = this.buildSortQuery(criteria);
    const { skip, limit } = await this.calculatePagination(criteria);
    const [rows, total] = await this.executeQueryWithPagination(
      collection,
      mongoQuery,
      sortQuery,
      skip,
      limit,
    );
    return new PaginatedResult<UserViewModel>(
      rows.map((doc) => /* yourMongoMapper.toViewModel(doc) */ doc as UserViewModel),
      total,
      criteria.pagination.page,
      criteria.pagination.perPage,
    );
  }
}
```

`FilterOperator` → MongoDB operator mapping:

| Enum value | MongoDB operator |
|---|---|
| `EQUALS` | `$eq` |
| `NOT_EQUALS` | `$ne` |
| `LIKE` | `$regex` |
| `IN` | `$in` |
| `GT` | `$gt` |
| `LT` | `$lt` |
| `GTE` | `$gte` |
| `LTE` | `$lte` |

#### Base DTO

```typescript
import { BaseMongoDto } from '@sisques-labs/nestjs-kit/mongodb';

// Type: { id: string; createdAt: Date; updatedAt: Date }
type UserMongoDto = BaseMongoDto & {
  email: string;
  name: string;
};
```

---

### TypeORM

Import **`TypeOrmModule`** when you use TypeORM. It is **not** part of **`SharedModule`**. Use **`ConfigModule.forRoot`** (global or imported) so `ConfigService` is available; options are built at runtime via **`buildTypeOrmModuleOptions`** inside `forRootAsync`—no database env is read when you merely `import` the package.

#### Environment Variables

```env
DATABASE_DRIVER=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=secret
DATABASE_DATABASE=my_database
DATABASE_SYNCHRONIZE=false
DATABASE_MIGRATIONS_TABLE_NAME=migrations
```

Optional: `NODE_ENV` (affects query logging). For TypeORM CLI migrations that use `data-source.ts`, the same variables must be set in the environment when the CLI runs.

#### Base Entity

```typescript
import { BaseTypeormEntity } from '@sisques-labs/nestjs-kit/typeorm';
import { Entity, Column } from 'typeorm';

@Entity('users')
export class UserTypeormEntity extends BaseTypeormEntity {
  // Inherited: id (UUID, primary key), createdAt, updatedAt, deletedAt (soft delete)

  @Column()
  email: string;
}
```

#### Base Repository

```typescript
import {
  BaseTypeormMasterRepository,
  TypeormMasterService,
} from '@sisques-labs/nestjs-kit/typeorm';

@Injectable()
export class UserTypeormRepository extends BaseTypeormMasterRepository {
  constructor(typeormService: TypeormMasterService) {
    super(typeormService);
  }

  async findById(id: string): Promise<UserAggregate | null> {
    const repo = this.getRepository(UserTypeormEntity);
    const entity = await repo.findOneBy({ id });
    return entity ? UserWriteFactory.fromPrimitives(entity) : null;
  }
}
```

#### Base DTO

```typescript
import { BaseTypeormDto } from '@sisques-labs/nestjs-kit/typeorm';

// Type: { id: string; createdAt: Date; updatedAt: Date }
type UserTypeormDto = BaseTypeormDto & {
  email: string;
};
```

#### Criteria → QueryBuilder

`applyCriteriaToQueryBuilder` translates a `Criteria`'s `filters`/`sorts` into
`WHERE`/`ORDER BY` clauses on a TypeORM `SelectQueryBuilder`, covering all 8
`FilterOperator` values with index-scoped parameter names (`filter0`,
`filter1`, ...) so the same field can appear more than once (e.g. a date
range) without parameter collisions. It mutates and returns the same builder
for chaining; pagination (`.skip()/.take()`) and any tenant-scoping `.where()`
remain the caller's responsibility.

```typescript
import { applyCriteriaToQueryBuilder } from '@sisques-labs/nestjs-kit/typeorm';
import {
  BaseDatabaseRepository,
  Criteria,
  PaginatedResult,
  SortDirection,
} from '@sisques-labs/nestjs-kit';

@Injectable()
export class PlantTypeOrmReadRepository extends BaseDatabaseRepository {
  async findByCriteria(criteria: Criteria): Promise<PaginatedResult<PlantViewModel>> {
    const { page, limit, skip } = await this.calculatePagination(criteria);

    const qb = this.repo
      .createQueryBuilder('plant')
      .where('plant.spaceId = :spaceId', { spaceId: this.spaceContext.require() });

    applyCriteriaToQueryBuilder(qb, criteria, {
      alias: 'plant',
      defaultSort: { field: 'createdAt', direction: SortDirection.DESC },
    });

    const [entities, total] = await qb.skip(skip).take(limit).getManyAndCount();
    const items = entities.map((e) => this.mapper.toViewModel(e));
    return new PaginatedResult(items, total, page, limit);
  }
}
```

Use `onCustomFilter` for virtual/cross-column filters that don't map to a
plain `column operator value` clause — return `true` to skip the standard
switch for that filter:

```typescript
applyCriteriaToQueryBuilder(qb, criteria, {
  alias: 'item',
  onCustomFilter: (qb, filter) => {
    if (filter.field !== 'low_stock') return false;
    if (filter.value) {
      qb.andWhere('item.lowStockThreshold IS NOT NULL AND item.quantity <= item.lowStockThreshold');
    }
    return true;
  },
});
```

---

## Transport Layer (GraphQL)

If you use **`@nestjs/graphql`**, call **`registerSharedGraphqlEnums()`** once before schema generation (for example at the top of `main.ts` before `NestFactory.create`, or from a small module imported by `AppModule`). Add **`MutationResponseGraphQLMapper`** and **`ComplexityPlugin`** to your own GraphQL module’s **`providers`** when you use them—this package does **not** register them via **`SharedModule`**.

```typescript
import { registerSharedGraphqlEnums } from '@sisques-labs/nestjs-kit/graphql';

registerSharedGraphqlEnums();
```

### Input DTOs

#### `BaseFindByCriteriaInput`

Composite input for list queries combining filters, sorts, and pagination.

```graphql
query {
  users(
    criteria: {
      filters: [{ field: "email", operator: EQUALS, value: "user@example.com" }]
      sorts: [{ field: "createdAt", direction: DESC }]
      pagination: { page: 1, perPage: 20 }
    }
  ) {
    total
    page
    perPage
    totalPages
    data { id email }
  }
}
```

```typescript
import { BaseFindByCriteriaInput } from '@sisques-labs/nestjs-kit/graphql';

@Resolver()
export class UserResolver {
  @Query(() => UsersPaginatedResult)
  users(@Args('criteria') criteria: BaseFindByCriteriaInput) {
    return this.userService.findByCriteria(criteria);
  }
}
```

Individual input types: `BaseFilterInput`, `BaseSortInput`, `BasePaginationInput`, `NumericRangeInput`.

`BaseFilterInput.field` and `BaseSortInput.value` accept any `String`/`JSON` by
default — fine for a quick resolver, but it means a client can filter on any
field name and send any value. To restrict both per bounded context, use
`createFilterInput`/`createSortInput` plus a `FilterFieldRegistry`:

```typescript
import {
  createFilterInput,
  createSortInput,
  FilterFieldRegistry,
  FilterValidationPipe,
} from '@sisques-labs/nestjs-kit/graphql';
import { InputType, registerEnumType } from '@nestjs/graphql';

enum UserQueryableField {
  EMAIL = 'email',
  STATUS = 'status',
  CREATED_AT = 'createdAt',
}
registerEnumType(UserQueryableField, { name: 'UserQueryableFieldEnum' });

// field is now typed to UserQueryableFieldEnum instead of a free String.
// createFilterInput/createSortInput register their returned class as
// `{ isAbstract: true }` (same technique @nestjs/graphql's own PartialType/
// PickType/OmitType use) — the subclass below MUST carry its own
// @InputType(name) to actually register a concrete GraphQL type.
@InputType('UserFilterInput')
export class UserFilterInput extends createFilterInput(UserQueryableField, 'User') {}
@InputType('UserSortInput')
export class UserSortInput extends createSortInput(UserQueryableField, 'User') {}

// declares what `value` must look like per field, including enum membership
const userFilterableFields: FilterFieldRegistry<UserQueryableField> = {
  email: { type: 'string' },
  status: { type: 'enum', enum: UserStatusEnum },
  createdAt: { type: 'date' },
};

@Resolver()
export class UserResolver {
  @Query(() => UsersPaginatedResult)
  users(
    @Args('input', new FilterValidationPipe(userFilterableFields))
    input: UserFindByCriteriaRequestDto,
  ) {
    return this.userService.findByCriteria(input);
  }
}
```

`FilterValidationPipe` throws `BadRequestException` for an unknown `field` or
a `value` that doesn't match the registry entry (enum entries validate
against `Object.values(enum)`, so the domain enum stays the single source of
truth). It only reads `input.filters`, so it works the same way behind REST
or MCP transports, not just GraphQL resolvers.

---

### Response DTOs

#### `BasePaginatedResultDto`

```typescript
import { BasePaginatedResultDto } from '@sisques-labs/nestjs-kit/graphql';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UsersPaginatedResult extends BasePaginatedResultDto {
  @Field(() => [UserDto])
  data: UserDto[];
  // Inherited: total, page, perPage, totalPages (computed automatically)
}
```

#### `MutationResponseDto`

```typescript
import { MutationResponseDto } from '@sisques-labs/nestjs-kit/graphql';

// Shape: { success: boolean; message?: string; id?: string }

@Mutation(() => MutationResponseDto)
createUser(@Args('input') input: CreateUserInput): Promise<MutationResponseDto> { ... }
```

#### `MutationResponseArrayDto`

```typescript
import { MutationResponseArrayDto } from '@sisques-labs/nestjs-kit/graphql';

// Shape: { success: boolean; message?: string; ids: string[] }

@Mutation(() => MutationResponseArrayDto)
deleteUsers(@Args('ids', { type: () => [String] }) ids: string[]): Promise<MutationResponseArrayDto> { ... }
```

---

### Mappers

`MutationResponseGraphQLMapper` is a NestJS injectable that maps domain results to `MutationResponseDto`. Register it in the module that declares your resolvers (or a dedicated GraphQL module).

```typescript
import { MutationResponseGraphQLMapper } from '@sisques-labs/nestjs-kit/graphql';

@Module({
  providers: [MutationResponseGraphQLMapper, UserResolver],
})
export class UserGraphqlModule {}

@Resolver()
export class UserResolver {
  constructor(private readonly mutationMapper: MutationResponseGraphQLMapper) {}

  @Mutation(() => MutationResponseDto)
  async createUser(@Args('input') input: CreateUserInput) {
    const result = await this.commandBus.execute(new CreateUserCommand(input));
    return this.mutationMapper.map(result);
  }
}
```

---

### Complexity Plugin

`ComplexityPlugin` is an **Apollo Server plugin** (`@Plugin()` from `@nestjs/apollo`) that rejects operations whose estimated complexity exceeds **1000** (see `graphql-query-complexity`). It is **exported** from this package—add it to your GraphQL module’s **`providers`** (or equivalent) so Nest discovers the plugin.

To assign complexity weights to fields use the `@Complexity` decorator from `@nestjs/graphql`:

```typescript
import { Field, ObjectType, Complexity } from '@nestjs/graphql';

@ObjectType()
export class UserDto {
  @Field()
  @Complexity(1)
  id: string;
}
```

Register the plugin (for example next to your GraphQL module):

```typescript
import { Module } from '@nestjs/common';
import { ComplexityPlugin } from '@sisques-labs/nestjs-kit/graphql';

@Module({
  providers: [ComplexityPlugin],
})
export class GraphqlPluginsModule {}
```

---

## Enums

TypeScript enums are exported for domain and GraphQL use. For GraphQL schema generation, call **`registerSharedGraphqlEnums()`** once (see [Transport Layer (GraphQL)](#transport-layer-graphql)).

```typescript
import {
  FilterOperator,
  SortDirection,
  LengthUnitEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@sisques-labs/nestjs-kit';

FilterOperator.EQUALS     // 'eq'
FilterOperator.NOT_EQUALS // 'ne'
FilterOperator.LIKE       // 'like'
FilterOperator.IN         // 'in'
FilterOperator.GT         // 'gt'
FilterOperator.LT         // 'lt'
FilterOperator.GTE        // 'gte'
FilterOperator.LTE        // 'lte'

SortDirection.ASC
SortDirection.DESC
```

---

## License

MIT — [Sisques Labs](https://github.com/JSisques)
