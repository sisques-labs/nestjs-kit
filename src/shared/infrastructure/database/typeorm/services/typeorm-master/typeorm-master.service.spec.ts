import { DataSource, EntityManager, Repository } from 'typeorm';

import { TypeormMasterService } from './typeorm-master.service';

class FakeEntity {}

describe('TypeormMasterService', () => {
  let dataSource: jest.Mocked<DataSource>;
  let service: TypeormMasterService;
  let repository: jest.Mocked<Repository<FakeEntity>>;
  let manager: EntityManager;

  beforeEach(() => {
    repository = {
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<FakeEntity>>;
    manager = {} as EntityManager;

    dataSource = {
      getRepository: jest.fn().mockReturnValue(repository),
      manager,
    } as unknown as jest.Mocked<DataSource>;

    service = new TypeormMasterService(dataSource);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDataSource', () => {
    it('returns the injected DataSource instance', () => {
      expect(service.getDataSource()).toBe(dataSource);
    });
  });

  describe('getRepository', () => {
    it('delegates to DataSource.getRepository with the given entity class', () => {
      const result = service.getRepository(FakeEntity);

      expect(dataSource.getRepository).toHaveBeenCalledWith(FakeEntity);
      expect(result).toBe(repository);
    });
  });

  describe('getEntityManager', () => {
    it('returns the DataSource EntityManager', () => {
      expect(service.getEntityManager()).toBe(manager);
    });
  });
});
