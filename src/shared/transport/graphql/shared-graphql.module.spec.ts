import { Test, type TestingModule } from '@nestjs/testing';

import { MutationResponseGraphQLMapper } from '@/shared/transport/graphql/mappers/mutation-response/mutation-response.mapper';

import { SharedGraphQLModule } from './shared-graphql.module';

describe('SharedGraphQLModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [SharedGraphQLModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('registers shared GraphQL mappers', () => {
    expect(module.get(MutationResponseGraphQLMapper)).toBeInstanceOf(
      MutationResponseGraphQLMapper,
    );
  });
});
