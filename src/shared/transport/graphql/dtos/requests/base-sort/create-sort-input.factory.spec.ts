import { SortDirection } from '@/shared/domain/enums/sort-direction.enum';

import { BaseSortInput } from './base-sort.input';
import { createSortInput } from './create-sort-input.factory';

enum TestQueryableField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
}

describe('createSortInput', () => {
  it('returns a class extending BaseSortInput', () => {
    const PlantSortInput = createSortInput(TestQueryableField, 'Plant');
    const instance = new PlantSortInput();

    expect(instance).toBeInstanceOf(BaseSortInput);
  });

  it('names the generated class after the context', () => {
    const PlantSortInput = createSortInput(TestQueryableField, 'Plant');

    expect(PlantSortInput.name).toBe('PlantSortInput');
  });

  it('accepts field/direction like the base input', () => {
    const PlantSortInput = createSortInput(TestQueryableField, 'Plant');
    const instance = new PlantSortInput();
    instance.field = TestQueryableField.CREATED_AT;
    instance.direction = SortDirection.DESC;

    expect(instance.field).toBe(TestQueryableField.CREATED_AT);
    expect(instance.direction).toBe(SortDirection.DESC);
  });

  it('produces independent classes per context', () => {
    const PlantSortInput = createSortInput(TestQueryableField, 'Plant');
    const UserSortInput = createSortInput(TestQueryableField, 'User');

    expect(PlantSortInput).not.toBe(UserSortInput);
    expect(PlantSortInput.name).toBe('PlantSortInput');
    expect(UserSortInput.name).toBe('UserSortInput');
  });
});
