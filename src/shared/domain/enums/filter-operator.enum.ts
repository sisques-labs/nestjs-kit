export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  LIKE = 'like',
  IN = 'in',
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN_OR_EQUAL = 'lte',
  IS_NULL = 'isnull',
  IS_NOT_NULL = 'notnull',
}

/**
 * Operators that test for the presence/absence of a value and therefore take
 * no `value` operand.
 */
export const NULL_FILTER_OPERATORS: readonly FilterOperator[] = [
  FilterOperator.IS_NULL,
  FilterOperator.IS_NOT_NULL,
];

/**
 * Whether the operator is a null-check operator ({@link FilterOperator.IS_NULL}
 * or {@link FilterOperator.IS_NOT_NULL}) that does not require a `value`.
 */
export function isNullFilterOperator(operator: FilterOperator): boolean {
  return NULL_FILTER_OPERATORS.includes(operator);
}
