import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';

import { BaseFilterInput } from './base-filter.input';
import { createFilterInput } from './create-filter-input.factory';

enum TestQueryableField {
  NAME = 'name',
  STATUS = 'status',
}

describe('createFilterInput', () => {
  it('returns a class extending BaseFilterInput', () => {
    const PlantFilterInput = createFilterInput(TestQueryableField, 'Plant');
    const instance = new PlantFilterInput();

    expect(instance).toBeInstanceOf(BaseFilterInput);
  });

  it('names the generated class after the context', () => {
    const PlantFilterInput = createFilterInput(TestQueryableField, 'Plant');

    expect(PlantFilterInput.name).toBe('PlantFilterInput');
  });

  it('accepts field/operator/value like the base input', () => {
    const PlantFilterInput = createFilterInput(TestQueryableField, 'Plant');
    const instance = new PlantFilterInput();
    instance.field = TestQueryableField.STATUS;
    instance.operator = FilterOperator.EQUALS;
    instance.value = 'ACTIVE';

    expect(instance.field).toBe(TestQueryableField.STATUS);
    expect(instance.operator).toBe(FilterOperator.EQUALS);
    expect(instance.value).toBe('ACTIVE');
  });

  it('produces independent classes per context', () => {
    const PlantFilterInput = createFilterInput(TestQueryableField, 'Plant');
    const UserFilterInput = createFilterInput(TestQueryableField, 'User');

    expect(PlantFilterInput).not.toBe(UserFilterInput);
    expect(PlantFilterInput.name).toBe('PlantFilterInput');
    expect(UserFilterInput.name).toBe('UserFilterInput');
  });
});
