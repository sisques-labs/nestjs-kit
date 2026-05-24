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
export * from './shared/domain/exceptions/value-objects/invalid-hex/invalid-hex.exception';
export * from './shared/domain/exceptions/value-objects/invalid-ip/invalid-ip.exception';
export * from './shared/domain/exceptions/value-objects/invalid-json/invalid-json.exception';
export * from './shared/domain/exceptions/value-objects/invalid-locale/invalid-locale.exception';
export * from './shared/domain/exceptions/value-objects/invalid-number/invalid-number.exception';
export * from './shared/domain/exceptions/value-objects/invalid-numeric-range/invalid-numeric-range.exception';
export * from './shared/domain/exceptions/value-objects/invalid-password/invalid-password.exception';
export * from './shared/domain/exceptions/value-objects/invalid-phone/invalid-phone.exception';
export * from './shared/domain/exceptions/value-objects/invalid-string/invalid-string.exception';
export * from './shared/domain/exceptions/value-objects/invalid-timezone/invalid-timezone.exception';
export * from './shared/domain/exceptions/value-objects/invalid-url/invalid-url.exception';
export * from './shared/domain/exceptions/value-objects/invalid-uuid/invalid-uuid.exception';

// Interfaces
export * from './shared/domain/interfaces/base-aggregate-dto.interface';
export * from './shared/domain/interfaces/base-view-model-dto.interface';
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
export * from './shared/domain/value-objects/hex/hex.vo';
export * from './shared/domain/value-objects/ip/ip.vo';
export * from './shared/domain/value-objects/json/json.vo';
export * from './shared/domain/value-objects/length-unit/length-unit.vo';
export * from './shared/domain/value-objects/locale/locale.vo';
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

// Logging (Winston config for nest-winston / winston.createLogger)
export * from './shared/infrastructure/logging/factories/create-shared-winston-logger-options';
export * from './shared/infrastructure/logging/formats/shared-winston.formats';
export * from './shared/infrastructure/logging/interfaces/shared-winston-logger-factory-options.interface';

// MongoDB
export * from './shared/infrastructure/database/mongodb/base-mongo/base-mongo-database.repository';
export * from './shared/infrastructure/database/mongodb/dtos/base-mongo.dto';
export * from './shared/infrastructure/database/mongodb/mappers/base-mongodb.mapper';
export * from './shared/infrastructure/database/mongodb/mongodb.module';
export * from './shared/infrastructure/database/mongodb/services/mongo.service';

// TypeORM
export * from './shared/infrastructure/database/typeorm/base-typeorm/base-typeorm-master/base-typeorm-master.repository';
export * from './shared/infrastructure/database/typeorm/dtos/base-typeorm.dto';
export * from './shared/infrastructure/database/typeorm/entities/base-typeorm.entity';
export * from './shared/infrastructure/database/typeorm/services/typeorm-master/typeorm-master.service';
export * from './shared/infrastructure/database/typeorm/typeorm-module-options.factory';
export * from './shared/infrastructure/database/typeorm/typeorm.module';

// Kafka
export * from './shared/infrastructure/kafka/interfaces/kafka-event-publisher.interface';

// Schema Registry
export * from './shared/infrastructure/kafka/schema-registry/schema-registry-options.interface';
export * from './shared/infrastructure/kafka/schema-registry/schema-registry.module';
export * from './shared/infrastructure/kafka/schema-registry/schema-registry.service';

// ─── Transport ────────────────────────────────────────────────────────────────

// GraphQL - Enum registration (opt-in; call before schema generation)
export * from './shared/transport/graphql/register-shared-graphql-enums';

// GraphQL - DTOs (Requests)
export * from './shared/transport/graphql/dtos/requests/base-filter/base-filter.input';
export * from './shared/transport/graphql/dtos/requests/base-find-by-criteria/base-find-by-criteria.input';
export * from './shared/transport/graphql/dtos/requests/base-pagination/base-pagination.input';
export * from './shared/transport/graphql/dtos/requests/base-sort/base-sort.input';
export * from './shared/transport/graphql/dtos/requests/numeric-range/numeric-range.input';

// GraphQL - DTOs (Responses)
export * from './shared/transport/graphql/dtos/responses/base-paginated-result/base-paginated-result.dto';
export * from './shared/transport/graphql/dtos/responses/numeric-range/numeric-range.dto';
export * from './shared/transport/graphql/dtos/responses/success-response/success-response.dto';
export * from './shared/transport/graphql/dtos/success-response-array.dto';

// GraphQL - Mappers
export * from './shared/transport/graphql/mappers/base-graphql.mapper';
export * from './shared/transport/graphql/mappers/mutation-response/mutation-response.mapper';

// GraphQL - Plugins
export * from './shared/transport/graphql/plugins/complexity.plugin';
