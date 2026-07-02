/**
 * Describes the expected shape of a `Filter.value` for one queryable field.
 * `enum` descriptors validate membership against the enum's own values
 * (`Object.values(enum)`), so the source of truth stays the domain enum —
 * never a value list duplicated in the registry.
 */
export type FilterFieldDescriptor =
  | { type: 'string' }
  | { type: 'number' }
  | { type: 'boolean' }
  | { type: 'uuid' }
  | { type: 'date' }
  | { type: 'enum'; enum: Record<string, string | number> };

/**
 * Per-context map of queryable field name -> expected value shape.
 * Consumed by {@link FilterValidationPipe} to validate `Filter.value`
 * against the field named in `Filter.field`.
 */
export type FilterFieldRegistry<TField extends string = string> = Record<
  TField,
  FilterFieldDescriptor
>;
