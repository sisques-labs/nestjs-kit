import * as GraphqlEntrypoint from './graphql';

describe('entrypoints/graphql barrel', () => {
  it('re-exports GraphQL DTOs, mappers, pipes and plugins', () => {
    expect(GraphqlEntrypoint.registerSharedGraphqlEnums).toBeDefined();
    expect(GraphqlEntrypoint.SharedGraphQLModule).toBeDefined();
    expect(GraphqlEntrypoint.BaseFilterInput).toBeDefined();
    expect(GraphqlEntrypoint.createFilterInput).toBeDefined();
    expect(GraphqlEntrypoint.BaseFindByCriteriaInput).toBeDefined();
    expect(GraphqlEntrypoint.BasePaginationInput).toBeDefined();
    expect(GraphqlEntrypoint.BaseSortInput).toBeDefined();
    expect(GraphqlEntrypoint.createSortInput).toBeDefined();
    expect(GraphqlEntrypoint.NumericRangeInputDto).toBeDefined();
    expect(GraphqlEntrypoint.BasePaginatedResultDto).toBeDefined();
    expect(GraphqlEntrypoint.NumericRangeResponseDto).toBeDefined();
    expect(GraphqlEntrypoint.MutationResponseDto).toBeDefined();
    expect(GraphqlEntrypoint.MutationResponseArrayDto).toBeDefined();
    expect(GraphqlEntrypoint.BaseGraphQLMapper).toBeDefined();
    expect(GraphqlEntrypoint.MutationResponseGraphQLMapper).toBeDefined();
    expect(GraphqlEntrypoint.FilterValidationPipe).toBeDefined();
    expect(GraphqlEntrypoint.ComplexityPlugin).toBeDefined();
  });
});
