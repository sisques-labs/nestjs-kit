import { Repository } from 'typeorm';

import { TypeormMasterService } from '@/shared/infrastructure/database/typeorm/services/typeorm-master/typeorm-master.service';

import { BaseTypeormMasterRepository } from './base-typeorm-master.repository';

class FakeEntity {}

class TestRepository extends BaseTypeormMasterRepository<FakeEntity> {
  constructor(typeormMasterService: TypeormMasterService) {
    super(typeormMasterService, FakeEntity);
  }

  callGetRepository<U>(entityClass: new () => U) {
    return this.getRepository(entityClass);
  }
}

describe('BaseTypeormMasterRepository', () => {
  let typeormMasterService: jest.Mocked<TypeormMasterService>;
  let repository: jest.Mocked<Repository<FakeEntity>>;

  beforeEach(() => {
    repository = { find: jest.fn() } as unknown as jest.Mocked<
      Repository<FakeEntity>
    >;
    typeormMasterService = {
      getRepository: jest.fn().mockReturnValue(repository),
    } as unknown as jest.Mocked<TypeormMasterService>;
  });

  it('resolves the entity repository from TypeormMasterService on construction', () => {
    const instance = new TestRepository(typeormMasterService);

    expect(typeormMasterService.getRepository).toHaveBeenCalledWith(FakeEntity);
    expect(instance['repository']).toBe(repository);
  });

  it('sets a Logger scoped to BaseTypeormMasterRepository', () => {
    const instance = new TestRepository(typeormMasterService);

    expect(instance['logger']).toBeDefined();
  });

  describe('getRepository', () => {
    it('delegates to TypeormMasterService.getRepository for any entity class', () => {
      class OtherEntity {}
      const otherRepository = {} as Repository<OtherEntity>;
      const instance = new TestRepository(typeormMasterService);

      typeormMasterService.getRepository.mockReturnValueOnce(
        otherRepository as unknown as Repository<FakeEntity>,
      );
      const result = instance.callGetRepository(OtherEntity);

      expect(typeormMasterService.getRepository).toHaveBeenCalledWith(
        OtherEntity,
      );
      expect(result).toBe(otherRepository);
    });
  });
});
