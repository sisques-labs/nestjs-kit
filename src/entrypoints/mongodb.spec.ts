import * as MongodbEntrypoint from './mongodb';

describe('entrypoints/mongodb barrel', () => {
  it('re-exports the MongoDB repository, mapper, module and service', () => {
    expect(MongodbEntrypoint.BaseMongoDatabaseRepository).toBeDefined();
    expect(MongodbEntrypoint.BaseMongoDBMapper).toBeDefined();
    expect(MongodbEntrypoint.MongoModule).toBeDefined();
    expect(MongodbEntrypoint.MongoService).toBeDefined();
  });
});
