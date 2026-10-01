import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import {
  FilterOperator,
  isNullFilterOperator,
} from '@/shared/domain/enums/filter-operator.enum';

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
   *
   * Optional only for the null operators ({@link FilterOperator.IS_NULL} /
   * {@link FilterOperator.IS_NOT_NULL}), which take no operand; every other
   * operator still requires a value. A value sent with a null operator is
   * accepted and ignored.
   */
  @Field(() => GraphQLJSON, {
    nullable: true,
    description:
      'The value to filter by. Not required for the isnull/notnull operators.',
  })
  @ValidateIf(
    (filter: BaseFilterInput) => !isNullFilterOperator(filter.operator),
  )
  @IsNotEmpty()
  value?: unknown;
}
