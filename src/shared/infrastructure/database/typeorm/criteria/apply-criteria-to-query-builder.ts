import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { Criteria, Filter, Sort } from '@/shared/domain/entities/criteria';
import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';

import { escapeLikePattern } from './escape-like-pattern';

/**
 * Options for {@link applyCriteriaToQueryBuilder}.
 */
export interface ApplyCriteriaToQueryBuilderOptions<
  Entity extends ObjectLiteral,
> {
  /** The query builder's root alias (e.g. `'plant'` for `createQueryBuilder('plant')`). */
  alias: string;
  /** Sort applied when `criteria.sorts` is empty. Defaults to no explicit order. */
  defaultSort?: Sort | Sort[];
  /**
   * Called for each filter before the standard operator switch. Return `true`
   * to signal the filter was fully handled (e.g. a virtual/cross-column
   * filter like `due_before` or `low_stock`) so the standard handling is
   * skipped for it.
   */
  onCustomFilter?: (qb: SelectQueryBuilder<Entity>, filter: Filter) => boolean;
}

/**
 * Translates a domain {@link Criteria}'s `filters` and `sorts` into `WHERE`/
 * `ORDER BY` clauses on a TypeORM {@link SelectQueryBuilder}, mutating and
 * returning the same builder for chaining (e.g. `.skip().take()`).
 *
 * Covers all 10 {@link FilterOperator} values. Each filter gets an
 * index-scoped query parameter name (`filter0`, `filter1`, ...) so the same
 * field can appear more than once (e.g. a date range using `GREATER_THAN_OR_EQUAL`
 * + `LESS_THAN_OR_EQUAL`) without parameter collisions.
 *
 * `LIKE` is a case-insensitive "contains" match on the column's text form: the
 * column is cast (`CAST(col AS text) ILIKE ... ESCAPE '\'`) so it also works on
 * date, timestamp, numeric and uuid columns, and `%`, `_` and `\` in the value
 * are matched literally. Note the cast prevents a plain btree index on the
 * column from being used; add an expression index on `((col::text))` if needed.
 *
 * Does not apply pagination or tenant scoping — callers remain responsible
 * for `.skip()/.take()` (see `BaseDatabaseRepository.calculatePagination`)
 * and for adding an explicit tenant `.where()` first when the query builder
 * bypasses a tenant-scoping repository proxy.
 *
 * @example
 * const qb = this.repo.createQueryBuilder('plant')
 *   .where('plant.spaceId = :spaceId', { spaceId: this.spaceContext.require() });
 * applyCriteriaToQueryBuilder(qb, criteria, {
 *   alias: 'plant',
 *   defaultSort: { field: 'createdAt', direction: SortDirection.DESC },
 * });
 * const [entities, total] = await qb.skip(skip).take(limit).getManyAndCount();
 */
export function applyCriteriaToQueryBuilder<Entity extends ObjectLiteral>(
  qb: SelectQueryBuilder<Entity>,
  criteria: Criteria,
  options: ApplyCriteriaToQueryBuilderOptions<Entity>,
): SelectQueryBuilder<Entity> {
  const { alias, defaultSort, onCustomFilter } = options;

  (criteria.filters ?? []).forEach((filter, index) => {
    if (onCustomFilter?.(qb, filter)) return;
    applyFilter(qb, filter, index, alias);
  });

  applySort(qb, criteria.sorts, alias, defaultSort);

  return qb;
}

function applyFilter<Entity extends ObjectLiteral>(
  qb: SelectQueryBuilder<Entity>,
  filter: Filter,
  index: number,
  alias: string,
): void {
  const column = `${alias}.${filter.field}`;
  const param = `filter${index}`;

  switch (filter.operator) {
    case FilterOperator.EQUALS:
      qb.andWhere(`${column} = :${param}`, { [param]: filter.value });
      break;
    case FilterOperator.NOT_EQUALS:
      qb.andWhere(`${column} != :${param}`, { [param]: filter.value });
      break;
    case FilterOperator.LIKE:
      qb.andWhere(`CAST(${column} AS text) ILIKE :${param} ESCAPE '\\'`, {
        [param]: `%${escapeLikePattern(String(filter.value))}%`,
      });
      break;
    case FilterOperator.IN:
      qb.andWhere(`${column} IN (:...${param})`, {
        [param]: Array.isArray(filter.value) ? filter.value : [filter.value],
      });
      break;
    case FilterOperator.GREATER_THAN:
      qb.andWhere(`${column} > :${param}`, { [param]: filter.value });
      break;
    case FilterOperator.LESS_THAN:
      qb.andWhere(`${column} < :${param}`, { [param]: filter.value });
      break;
    case FilterOperator.GREATER_THAN_OR_EQUAL:
      qb.andWhere(`${column} >= :${param}`, { [param]: filter.value });
      break;
    case FilterOperator.LESS_THAN_OR_EQUAL:
      qb.andWhere(`${column} <= :${param}`, { [param]: filter.value });
      break;
    case FilterOperator.IS_NULL:
      qb.andWhere(`${column} IS NULL`);
      break;
    case FilterOperator.IS_NOT_NULL:
      qb.andWhere(`${column} IS NOT NULL`);
      break;
  }
}

function applySort<Entity extends ObjectLiteral>(
  qb: SelectQueryBuilder<Entity>,
  sorts: Sort[],
  alias: string,
  defaultSort?: Sort | Sort[],
): void {
  const effectiveSorts = sorts?.length ? sorts : toSortArray(defaultSort);

  effectiveSorts.forEach((sort, index) => {
    const column = `${alias}.${sort.field}`;
    if (index === 0) qb.orderBy(column, sort.direction);
    else qb.addOrderBy(column, sort.direction);
  });
}

function toSortArray(defaultSort?: Sort | Sort[]): Sort[] {
  if (!defaultSort) return [];
  return Array.isArray(defaultSort) ? defaultSort : [defaultSort];
}
