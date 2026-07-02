import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';

@InputType('BaseFilterInput')
export class BaseFilterInput {
  @Field(() => String, { description: 'The field to filter by' })
  @IsString()
  @IsNotEmpty()
  field: string;

  @Field(() => FilterOperator, { description: 'The operator to filter by' })
  @IsEnum(FilterOperator)
  @IsNotEmpty()
  operator: FilterOperator;

  /**
   * Arbitrary JSON so `IN` can carry an array and enum-backed fields can
   * carry their real value type — validated per-field by
   * {@link FilterValidationPipe} against a context's `FilterFieldRegistry`,
   * not constrained here (this type is shared across every context).
   */
  @Field(() => GraphQLJSON, { description: 'The value to filter by' })
  @IsNotEmpty()
  value: unknown;
}
