import { BadRequestException, PipeTransform } from '@nestjs/common';

import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';
import {
  FilterFieldDescriptor,
  FilterFieldRegistry,
} from '@/shared/domain/interfaces/criteria/filter-field-registry.interface';
import { BaseFilterInput } from '@/shared/transport/graphql/dtos/requests/base-filter/base-filter.input';

interface FindByCriteriaLikeInput {
  filters?: BaseFilterInput[];
}

/**
 * Validates `input.filters` against a per-context {@link FilterFieldRegistry}:
 * rejects unknown field names and values that don't match the field's
 * expected shape (including enum membership, sourced from the real domain
 * enum). Transport-agnostic — apply it to a GraphQL argument, a REST body,
 * or an MCP tool input; it only reads `filters` off whatever it's given.
 *
 * @example
 * @Args('input', new FilterValidationPipe(plantFilterableFields)) input: PlantFindByCriteriaRequestDto
 */
export class FilterValidationPipe<
  TField extends string = string,
> implements PipeTransform {
  constructor(private readonly registry: FilterFieldRegistry<TField>) {}

  transform(value: FindByCriteriaLikeInput): FindByCriteriaLikeInput {
    for (const filter of value?.filters ?? []) {
      const descriptor = this.registry[filter.field as TField];
      if (!descriptor) {
        throw new BadRequestException(
          `Unknown filter field: "${filter.field}"`,
        );
      }
      this.validateValue(
        filter.field,
        filter.operator,
        filter.value,
        descriptor,
      );
    }

    return value;
  }

  private validateValue(
    field: string,
    operator: FilterOperator,
    value: unknown,
    descriptor: FilterFieldDescriptor,
  ): void {
    const values =
      operator === FilterOperator.IN
        ? Array.isArray(value)
          ? value
          : [value]
        : [value];

    for (const candidate of values) {
      if (!this.matchesDescriptor(candidate, descriptor)) {
        throw new BadRequestException(
          `Invalid value ${JSON.stringify(candidate)} for filter field "${field}"${this.expectationMessage(descriptor)}`,
        );
      }
    }
  }

  private matchesDescriptor(
    value: unknown,
    descriptor: FilterFieldDescriptor,
  ): boolean {
    switch (descriptor.type) {
      case 'enum':
        return Object.values(descriptor.enum).includes(
          value as string | number,
        );
      case 'string':
      case 'uuid':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return typeof value === 'string' && !isNaN(Date.parse(value));
      default:
        return false;
    }
  }

  private expectationMessage(descriptor: FilterFieldDescriptor): string {
    if (descriptor.type === 'enum') {
      return ` — expected one of: ${Object.values(descriptor.enum).join(', ')}`;
    }
    return ` — expected ${descriptor.type}`;
  }
}
