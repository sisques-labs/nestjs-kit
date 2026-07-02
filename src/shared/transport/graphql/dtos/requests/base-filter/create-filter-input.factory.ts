import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { BaseFilterInput } from '@/shared/transport/graphql/dtos/requests/base-filter/base-filter.input';

/**
 * Produces a per-context `{ContextName}FilterInput`, identical to
 * {@link BaseFilterInput} except `field` is typed to the given GraphQL enum
 * instead of a free `String!` — so a client can only ever select one of the
 * context's actual queryable fields (whitelist, not free text), while
 * `filters` stays an arbitrary-length array the client assembles itself.
 *
 * @example
 * export class PlantFilterInput extends createFilterInput(PlantQueryableFieldEnum, 'Plant') {}
 */
export function createFilterInput(
  fieldEnum: object,
  contextName: string,
): new () => BaseFilterInput {
  @InputType(`${contextName}FilterInput`)
  class FilterInput extends BaseFilterInput {
    @Field(() => fieldEnum, { description: 'The field to filter by' })
    @IsEnum(fieldEnum)
    @IsNotEmpty()
    declare field: string;
  }

  Object.defineProperty(FilterInput, 'name', {
    value: `${contextName}FilterInput`,
  });

  return FilterInput;
}
