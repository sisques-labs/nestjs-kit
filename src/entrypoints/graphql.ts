// ─── GraphQL ─────────────────────────────────────────────────────────────────
// Separate entry point so importing '@sisques-labs/nestjs-kit' does not
// require the optional `@nestjs/graphql`, `@apollo/server`, `graphql`,
// `graphql-query-complexity`, and `graphql-type-json` peer dependencies.
// Import from '@sisques-labs/nestjs-kit/graphql' when you use these DTOs,
// mappers, pipes, or plugins.

// Enum registration (opt-in; call before schema generation)
export * from '../shared/transport/graphql/register-shared-graphql-enums';
export * from '../shared/transport/graphql/shared-graphql.module';

// DTOs (Requests)
export * from '../shared/transport/graphql/dtos/requests/base-filter/base-filter.input';
export * from '../shared/transport/graphql/dtos/requests/base-filter/create-filter-input.factory';
export * from '../shared/transport/graphql/dtos/requests/base-find-by-criteria/base-find-by-criteria.input';
export * from '../shared/transport/graphql/dtos/requests/base-pagination/base-pagination.input';
export * from '../shared/transport/graphql/dtos/requests/base-sort/base-sort.input';
export * from '../shared/transport/graphql/dtos/requests/base-sort/create-sort-input.factory';
export * from '../shared/transport/graphql/dtos/requests/numeric-range/numeric-range.input';

// DTOs (Responses)
export * from '../shared/transport/graphql/dtos/responses/base-paginated-result/base-paginated-result.dto';
export * from '../shared/transport/graphql/dtos/responses/numeric-range/numeric-range.dto';
export * from '../shared/transport/graphql/dtos/responses/success-response/success-response.dto';
export * from '../shared/transport/graphql/dtos/success-response-array.dto';

// Mappers
export * from '../shared/transport/graphql/mappers/base-graphql.mapper';
export * from '../shared/transport/graphql/mappers/mutation-response/mutation-response.mapper';

// Pipes
export * from '../shared/transport/graphql/pipes/filter-validation/filter-validation.pipe';

// Plugins
export * from '../shared/transport/graphql/plugins/complexity.plugin';
