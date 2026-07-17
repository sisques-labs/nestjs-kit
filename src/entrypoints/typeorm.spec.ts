import * as TypeormEntrypoint from './typeorm';

describe('entrypoints/typeorm barrel', () => {
  it('re-exports the TypeORM repository, criteria helper, entity, mapper, service, factory and module', () => {
    expect(TypeormEntrypoint.BaseTypeormMasterRepository).toBeDefined();
    expect(TypeormEntrypoint.applyCriteriaToQueryBuilder).toBeDefined();
    expect(TypeormEntrypoint.BaseTypeormEntity).toBeDefined();
    expect(TypeormEntrypoint.BaseTypeOrmMapper).toBeDefined();
    expect(TypeormEntrypoint.TypeormMasterService).toBeDefined();
    expect(TypeormEntrypoint.buildTypeOrmModuleOptions).toBeDefined();
    expect(TypeormEntrypoint.TypeOrmModule).toBeDefined();
  });
});
