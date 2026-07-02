import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { BaseSortInput } from '@/shared/transport/graphql/dtos/requests/base-sort/base-sort.input';

/**
 * Produces a per-context `{ContextName}SortInput` base, identical to
 * {@link BaseSortInput} except `field` is typed to the given GraphQL enum
 * instead of a free `String!`. Pass the same enum used for that context's
 * `createFilterInput` when sortable fields are the same set as filterable
 * fields (the common case).
 *
 * The returned class is registered `{ isAbstract: true }` (same technique as
 * `@nestjs/graphql`'s own `PartialType`/`PickType`/`OmitType`), so it is never
 * emitted into the schema by itself — the caller's subclass must carry its
 * own `@InputType(name)` to actually register a concrete GraphQL type.
 *
 * @example
 * @InputType('PlantSortInput')
 * export class PlantSortInput extends createSortInput(PlantQueryableFieldEnum, 'Plant') {}
 */
export function createSortInput(
  fieldEnum: object,
  contextName: string,
): new () => BaseSortInput {
  @InputType({ isAbstract: true })
  class SortInput extends BaseSortInput {
    @Field(() => fieldEnum, { description: 'The field to sort by' })
    @IsEnum(fieldEnum)
    @IsNotEmpty()
    declare field: string;
  }

  Object.defineProperty(SortInput, 'name', {
    value: `${contextName}SortInput`,
  });

  return SortInput;
}
