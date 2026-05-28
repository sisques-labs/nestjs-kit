import { Criteria } from '@/shared/domain/entities/criteria';
import { SortDirection } from '@/shared/domain/enums/sort-direction.enum';

import { BaseDatabaseRepository } from './base-database.repository';

describe('BaseDatabaseRepository', () => {
  class TestableBaseDatabaseRepository extends BaseDatabaseRepository {
    public getTypeOrmOrder(criteria: Criteria): Record<string, 'ASC' | 'DESC'> {
      return this.buildTypeOrmOrder(criteria);
    }
  }

  let repository: TestableBaseDatabaseRepository;

  beforeEach(() => {
    repository = new TestableBaseDatabaseRepository();
  });

  describe('calculatePagination', () => {
    it('should calculate pagination with default values', async () => {
      const criteria = new Criteria();

      const result = await repository.calculatePagination(criteria);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(0);
    });

    it('should calculate pagination with custom page and perPage', async () => {
      const criteria = new Criteria([], [], { page: 3, perPage: 20 });

      const result = await repository.calculatePagination(criteria);

      expect(result.page).toBe(3);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(40); // (3 - 1) * 20
    });

    it('should calculate pagination for first page', async () => {
      const criteria = new Criteria([], [], { page: 1, perPage: 5 });

      const result = await repository.calculatePagination(criteria);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.skip).toBe(0);
    });

    it('should calculate pagination for second page', async () => {
      const criteria = new Criteria([], [], { page: 2, perPage: 15 });

      const result = await repository.calculatePagination(criteria);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
      expect(result.skip).toBe(15); // (2 - 1) * 15
    });

    it('should handle large page numbers', async () => {
      const criteria = new Criteria([], [], { page: 100, perPage: 50 });

      const result = await repository.calculatePagination(criteria);

      expect(result.page).toBe(100);
      expect(result.limit).toBe(50);
      expect(result.skip).toBe(4950); // (100 - 1) * 50
    });
  });

  describe('buildTypeOrmOrder', () => {
    it('should build order object from criteria sorts', () => {
      const criteria = new Criteria(
        [],
        [
          { field: 'createdAt', direction: SortDirection.DESC },
          { field: 'email', direction: SortDirection.ASC },
        ],
      );

      const result = repository.getTypeOrmOrder(criteria);

      expect(result).toEqual({
        createdAt: 'DESC',
        email: 'ASC',
      });
    });

    it('should return empty order object when no sorts are provided', () => {
      const criteria = new Criteria();

      const result = repository.getTypeOrmOrder(criteria);

      expect(result).toEqual({});
    });
  });
});
