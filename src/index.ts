// ─── Application ─────────────────────────────────────────────────────────────

export * from './shared/application/commands/base/base-command.handler';
export * from './shared/application/commands/interfaces/base-command-handler.interface';
export * from './shared/application/commands/update/base-update/base-update.command-handler';
export * from './shared/application/dtos/commands/delete/delete-command.dto';
export * from './shared/application/dtos/commands/field-changed/base-field-changed-command.dto';
export * from './shared/application/dtos/commands/update/update-command.dto';
export * from './shared/application/dtos/queries/find-by-criteria/find-by-criteria-query.dto';
export * from './shared/application/dtos/queries/find-by-id/find-by-id-query.dto';
export * from './shared/application/services/base-service/base-service.interface';

// ─── Domain ──────────────────────────────────────────────────────────────────

// Aggregates
export * from './shared/domain/aggregates/base-aggregate/base.aggregate';

// Builders
export * from './shared/domain/builders/base.builder';

// Entities
export * from './shared/domain/entities/criteria';
export * from './shared/domain/entities/paginated-result.entity';

// Enums
export * from './shared/domain/enums/filter-operator.enum';
export * from './shared/domain/enums/length-unit/length-unit.enum';
export * from './shared/domain/enums/sort-direction.enum';
export * from './shared/domain/enums/user-context/user/user-role/user-role.enum';
export * from './shared/domain/enums/user-context/user/user-status/user-status.enum';

// Events
export * from './shared/domain/events/base-event.interface';

// Exceptions
export * from './shared/domain/exceptions/base.exception';
export * from './shared/domain/exceptions/field-is-required.exception';
export * from './shared/domain/exceptions/value-objects/invalid-boolean/invalid-boolean.exception';
export * from './shared/domain/exceptions/value-objects/invalid-color/invalid-color.exception';
export * from './shared/domain/exceptions/value-objects/invalid-dimensions/invalid-dimensions.exception';
export * from './shared/domain/exceptions/value-objects/invalid-email/invalid-email.exception';
export * from './shared/domain/exceptions/value-objects/invalid-enum-value/invalid-enum-value.exception';
export * from './shared/domain/exceptions/value-objects/invalid-filename/invalid-filename.exception';
export * from './shared/domain/exceptions/value-objects/invalid-hex/invalid-hex.exception';
export * from './shared/domain/exceptions/value-objects/invalid-ip/invalid-ip.exception';
export * from './shared/domain/exceptions/value-objects/invalid-json/invalid-json.exception';
export * from './shared/domain/exceptions/value-objects/invalid-locale/invalid-locale.exception';
export * from './shared/domain/exceptions/value-objects/invalid-mime-type/invalid-mime-type.exception';
export * from './shared/domain/exceptions/value-objects/invalid-number/invalid-number.exception';
export * from './shared/domain/exceptions/value-objects/invalid-numeric-range/invalid-numeric-range.exception';
export * from './shared/domain/exceptions/value-objects/invalid-password/invalid-password.exception';
export * from './shared/domain/exceptions/value-objects/invalid-phone/invalid-phone.exception';
export * from './shared/domain/exceptions/value-objects/invalid-string/invalid-string.exception';
export * from './shared/domain/exceptions/value-objects/invalid-timezone/invalid-timezone.exception';
export * from './shared/domain/exceptions/value-objects/invalid-url/invalid-url.exception';
export * from './shared/domain/exceptions/value-objects/invalid-uuid/invalid-uuid.exception';

// Interfaces
export * from './shared/domain/interfaces/builders/base-builder.interface';
export * from './shared/domain/interfaces/base-aggregate-dto.interface';
export * from './shared/domain/interfaces/base-view-model-dto.interface';
export * from './shared/domain/interfaces/criteria/filter-field-registry.interface';
export * from './shared/domain/interfaces/event-metadata.interface';
export * from './shared/domain/interfaces/events/base-event-data.interface';
export * from './shared/domain/interfaces/factories/read-factory.interface';
export * from './shared/domain/interfaces/factories/write-factory.interface';
export * from './shared/domain/interfaces/numeric-range.interface';
export * from './shared/domain/interfaces/repository/base-read-repository.interface';
export * from './shared/domain/interfaces/repository/base-write-repository.interface';
export * from './shared/domain/interfaces/updated-field.interface';

// Primitives
export * from './shared/domain/primitives/base-primitives/base.primitives';

// Value Objects
export * from './shared/domain/value-objects/base/value-object.base';
export * from './shared/domain/value-objects/boolean/boolean.vo';
export * from './shared/domain/value-objects/color/color.vo';
export * from './shared/domain/value-objects/date/date.vo';
export * from './shared/domain/value-objects/dimensions/dimensions.vo';
export * from './shared/domain/value-objects/email/email.vo';
export * from './shared/domain/value-objects/enum/enum.vo';
export * from './shared/domain/value-objects/filename/filename.vo';
export * from './shared/domain/value-objects/hex/hex.vo';
export * from './shared/domain/value-objects/ip/ip.vo';
export * from './shared/domain/value-objects/json/json.vo';
export * from './shared/domain/value-objects/length-unit/length-unit.vo';
export * from './shared/domain/value-objects/locale/locale.vo';
export * from './shared/domain/value-objects/mime-type/mime-type.vo';
export * from './shared/domain/value-objects/number/number.vo';
export * from './shared/domain/value-objects/numeric-range/numeric-range.vo';
export * from './shared/domain/value-objects/password/password.vo';
export * from './shared/domain/value-objects/phone-code/phone-code.vo';
export * from './shared/domain/value-objects/phone/phone.vo';
export * from './shared/domain/value-objects/slug/slug.vo';
export * from './shared/domain/value-objects/string/string.vo';
export * from './shared/domain/value-objects/timezone/timezone.vo';
export * from './shared/domain/value-objects/url/url.vo';
export * from './shared/domain/value-objects/uuid/uuid.vo';

// View Models
export * from './shared/domain/view-models/base-view-model/base-view-model';

// ─── Infrastructure ───────────────────────────────────────────────────────────

export * from './shared/infrastructure/database/base-database.repository';
export * from './shared/infrastructure/database/mappers/base-database.mapper';

// Logging (Winston config for nest-winston / winston.createLogger)
export * from './shared/infrastructure/logging/factories/create-shared-winston-logger-options';
export * from './shared/infrastructure/logging/formats/shared-winston.formats';
export * from './shared/infrastructure/logging/interfaces/shared-winston-logger-factory-options.interface';

// MongoDB, TypeORM, Kafka, and GraphQL exports live in dedicated subpaths
// so they don't pull in their optional peer dependencies from the root
// import: '@sisques-labs/nestjs-kit/mongodb', '/typeorm', '/kafka', '/graphql'.
