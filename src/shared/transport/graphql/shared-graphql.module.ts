import { Global, Module } from '@nestjs/common';

import { MutationResponseGraphQLMapper } from '@/shared/transport/graphql/mappers/mutation-response/mutation-response.mapper';

const MAPPERS = [MutationResponseGraphQLMapper];

/**
 * Opt-in shared GraphQL helpers. Import once in the app root to make
 * shared GraphQL mappers available across feature modules.
 */
@Global()
@Module({
  providers: [...MAPPERS],
  exports: [...MAPPERS],
})
export class SharedGraphQLModule {}
