import { SelectQueryBuilder } from 'typeorm';

import { Criteria, Filter } from '@/shared/domain/entities/criteria';
import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';
import { SortDirection } from '@/shared/domain/enums/sort-direction.enum';

import { applyCriteriaToQueryBuilder } from './apply-criteria-to-query-builder';

interface TestEntity {
  id: string;
  name: string;
  createdAt: Date;
}

function createMockQueryBuilder(): jest.Mocked<SelectQueryBuilder<TestEntity>> {
  const qb = {
    andWhere: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
  };
  return qb as unknown as jest.Mocked<SelectQueryBuilder<TestEntity>>;
}

describe('applyCriteriaToQueryBuilder', () => {
  let qb: jest.Mocked<SelectQueryBuilder<TestEntity>>;

  beforeEach(() => {
    qb = createMockQueryBuilder();
  });

  it('returns the same query builder instance for chaining', () => {
    const result = applyCriteriaToQueryBuilder(qb, new Criteria(), {
      alias: 'entity',
    });

    expect(result).toBe(qb);
  });

  it('applies no where/order clauses when filters and sorts are empty and no defaultSort given', () => {
    applyCriteriaToQueryBuilder(qb, new Criteria(), { alias: 'entity' });

    expect(qb.andWhere).not.toHaveBeenCalled();
    expect(qb.orderBy).not.toHaveBeenCalled();
    expect(qb.addOrderBy).not.toHaveBeenCalled();
  });

  describe('filters', () => {
    it.each([
      [FilterOperator.EQUALS, 'entity.name = :filter0', { filter0: 'rose' }],
      [
        FilterOperator.NOT_EQUALS,
        'entity.name != :filter0',
        { filter0: 'rose' },
      ],
      [
        FilterOperator.GREATER_THAN,
        'entity.name > :filter0',
        { filter0: 'rose' },
      ],
      [FilterOperator.LESS_THAN, 'entity.name < :filter0', { filter0: 'rose' }],
      [
        FilterOperator.GREATER_THAN_OR_EQUAL,
        'entity.name >= :filter0',
        { filter0: 'rose' },
      ],
      [
        FilterOperator.LESS_THAN_OR_EQUAL,
        'entity.name <= :filter0',
        { filter0: 'rose' },
      ],
    ])('translates %s into %s', (operator, expectedSql, expectedParams) => {
      const criteria = new Criteria([
        { field: 'name', operator, value: 'rose' },
      ]);

      applyCriteriaToQueryBuilder(qb, criteria, { alias: 'entity' });

      expect(qb.andWhere).toHaveBeenCalledWith(expectedSql, expectedParams);
    });

    it('translates LIKE into a case-insensitive ILIKE with wildcards', () => {
      const criteria = new Criteria([
        { field: 'name', operator: FilterOperator.LIKE, value: 'ros' },
      ]);

      applyCriteriaToQueryBuilder(qb, criteria, { alias: 'entity' });

      expect(qb.andWhere).toHaveBeenCalledWith('entity.name ILIKE :filter0', {
        filter0: '%ros%',
      });
    });

    it('translates IN with an array value as-is', () => {
      const criteria = new Criteria([
        {
          field: 'name',
          operator: FilterOperator.IN,
          value: ['rose', 'tulip'],
        },
      ]);

      applyCriteriaToQueryBuilder(qb, criteria, { alias: 'entity' });

      expect(qb.andWhere).toHaveBeenCalledWith('entity.name IN (:...filter0)', {
        filter0: ['rose', 'tulip'],
      });
    });

    it('wraps a non-array IN value into a single-element array', () => {
      const criteria = new Criteria([
        { field: 'name', operator: FilterOperator.IN, value: 'rose' },
      ]);

      applyCriteriaToQueryBuilder(qb, criteria, { alias: 'entity' });

      expect(qb.andWhere).toHaveBeenCalledWith('entity.name IN (:...filter0)', {
        filter0: ['rose'],
      });
    });

    it('gives each filter an index-scoped parameter name, avoiding collisions', () => {
      const criteria = new Criteria([
        {
          field: 'createdAt',
          operator: FilterOperator.GREATER_THAN_OR_EQUAL,
          value: '2026-01-01',
        },
        {
          field: 'createdAt',
          operator: FilterOperator.LESS_THAN_OR_EQUAL,
          value: '2026-12-31',
        },
      ]);

      applyCriteriaToQueryBuilder(qb, criteria, { alias: 'entity' });

      expect(qb.andWhere).toHaveBeenNthCalledWith(
        1,
        'entity.createdAt >= :filter0',
        { filter0: '2026-01-01' },
      );
      expect(qb.andWhere).toHaveBeenNthCalledWith(
        2,
        'entity.createdAt <= :filter1',
        { filter1: '2026-12-31' },
      );
    });

    it('skips the standard operator switch when onCustomFilter handles the filter', () => {
      const criteria = new Criteria([
        { field: 'low_stock', operator: FilterOperator.EQUALS, value: true },
      ]);
      const onCustomFilter = jest.fn((builder, filter: Filter) => {
        if (filter.field === 'low_stock') {
          builder.andWhere('entity.quantity <= entity.threshold');
          return true;
        }
        return false;
      });

      applyCriteriaToQueryBuilder(qb, criteria, {
        alias: 'entity',
        onCustomFilter,
      });

      expect(onCustomFilter).toHaveBeenCalledWith(qb, criteria.filters[0]);
      expect(qb.andWhere).toHaveBeenCalledTimes(1);
      expect(qb.andWhere).toHaveBeenCalledWith(
        'entity.quantity <= entity.threshold',
      );
    });

    it('falls back to the standard switch when onCustomFilter returns false', () => {
      const criteria = new Criteria([
        { field: 'name', operator: FilterOperator.EQUALS, value: 'rose' },
      ]);
      const onCustomFilter = jest.fn().mockReturnValue(false);

      applyCriteriaToQueryBuilder(qb, criteria, {
        alias: 'entity',
        onCustomFilter,
      });

      expect(qb.andWhere).toHaveBeenCalledWith('entity.name = :filter0', {
        filter0: 'rose',
      });
    });
  });

  describe('sorts', () => {
    it('applies a single criteria sort via orderBy', () => {
      const criteria = new Criteria(
        [],
        [{ field: 'name', direction: SortDirection.ASC }],
      );

      applyCriteriaToQueryBuilder(qb, criteria, { alias: 'entity' });

      expect(qb.orderBy).toHaveBeenCalledWith('entity.name', SortDirection.ASC);
      expect(qb.addOrderBy).not.toHaveBeenCalled();
    });

    it('applies multiple criteria sorts via orderBy + addOrderBy', () => {
      const criteria = new Criteria(
        [],
        [
          { field: 'name', direction: SortDirection.ASC },
          { field: 'createdAt', direction: SortDirection.DESC },
        ],
      );

      applyCriteriaToQueryBuilder(qb, criteria, { alias: 'entity' });

      expect(qb.orderBy).toHaveBeenCalledWith('entity.name', SortDirection.ASC);
      expect(qb.addOrderBy).toHaveBeenCalledWith(
        'entity.createdAt',
        SortDirection.DESC,
      );
    });

    it('falls back to a single defaultSort when criteria.sorts is empty', () => {
      applyCriteriaToQueryBuilder(qb, new Criteria(), {
        alias: 'entity',
        defaultSort: { field: 'createdAt', direction: SortDirection.DESC },
      });

      expect(qb.orderBy).toHaveBeenCalledWith(
        'entity.createdAt',
        SortDirection.DESC,
      );
      expect(qb.addOrderBy).not.toHaveBeenCalled();
    });

    it('falls back to an array defaultSort when criteria.sorts is empty', () => {
      applyCriteriaToQueryBuilder(qb, new Criteria(), {
        alias: 'entity',
        defaultSort: [
          { field: 'name', direction: SortDirection.ASC },
          { field: 'createdAt', direction: SortDirection.DESC },
        ],
      });

      expect(qb.orderBy).toHaveBeenCalledWith('entity.name', SortDirection.ASC);
      expect(qb.addOrderBy).toHaveBeenCalledWith(
        'entity.createdAt',
        SortDirection.DESC,
      );
    });

    it('prefers criteria.sorts over defaultSort when both are present', () => {
      const criteria = new Criteria(
        [],
        [{ field: 'name', direction: SortDirection.ASC }],
      );

      applyCriteriaToQueryBuilder(qb, criteria, {
        alias: 'entity',
        defaultSort: { field: 'createdAt', direction: SortDirection.DESC },
      });

      expect(qb.orderBy).toHaveBeenCalledWith('entity.name', SortDirection.ASC);
      expect(qb.orderBy).not.toHaveBeenCalledWith(
        'entity.createdAt',
        SortDirection.DESC,
      );
    });
  });
});
