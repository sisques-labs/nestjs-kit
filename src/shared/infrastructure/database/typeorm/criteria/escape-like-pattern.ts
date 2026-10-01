/**
 * Escapes the characters that are special inside a SQL `LIKE`/`ILIKE` pattern
 * (`\`, `%` and `_`) with a backslash so the value is matched literally.
 *
 * Pair it with an `ESCAPE '\'` clause in the query.
 *
 * @example
 * escapeLikePattern('50%'); // '50\%'
 */
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
