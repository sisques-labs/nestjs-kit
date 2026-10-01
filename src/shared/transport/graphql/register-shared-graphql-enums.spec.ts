import {
  FilterOperator,
  isNullFilterOperator,
  NULL_FILTER_OPERATORS,
} from '@/shared/domain/enums/filter-operator.enum';
import { SortDirection } from '@/shared/domain/enums/sort-direction.enum';
import { UserRoleEnum } from '@/shared/domain/enums/user-context/user/user-role/user-role.enum';
import { UserStatusEnum } from '@/shared/domain/enums/user-context/user/user-status/user-status.enum';

import { registerEnumType } from '@nestjs/graphql';

import { registerSharedGraphqlEnums } from './register-shared-graphql-enums';

jest.mock('@nestjs/graphql', () => ({
  ...jest.requireActual('@nestjs/graphql'),
  registerEnumType: jest.fn(),
}));

describe('registerSharedGraphqlEnums', () => {
  beforeAll(() => {
    registerSharedGraphqlEnums();
  });

  it('should register FilterOperator with GraphQL including the null operators', () => {
    const registration = (registerEnumType as jest.Mock).mock.calls.find(
      ([, options]) => options.name === 'FilterOperator',
    );

    expect(registration).toBeDefined();
    const registeredValues = Object.values(registration![0]);
    expect(registeredValues).toContain('isnull');
    expect(registeredValues).toContain('notnull');
  });

  it('should be callable without throwing', () => {
    expect(() => registerSharedGraphqlEnums()).not.toThrow();
  });

  it('should have FilterOperator enum defined', () => {
    expect(FilterOperator).toBeDefined();
    expect(typeof FilterOperator).toBe('object');
  });

  it('should expose the null operators with their wire values', () => {
    expect(FilterOperator.IS_NULL).toBe('isnull');
    expect(FilterOperator.IS_NOT_NULL).toBe('notnull');
  });

  it('should recognise only the null operators via isNullFilterOperator', () => {
    expect(NULL_FILTER_OPERATORS).toEqual([
      FilterOperator.IS_NULL,
      FilterOperator.IS_NOT_NULL,
    ]);
    expect(isNullFilterOperator(FilterOperator.IS_NULL)).toBe(true);
    expect(isNullFilterOperator(FilterOperator.IS_NOT_NULL)).toBe(true);
    expect(isNullFilterOperator(FilterOperator.EQUALS)).toBe(false);
    expect(isNullFilterOperator(FilterOperator.IN)).toBe(false);
  });

  it('should have SortDirection enum defined', () => {
    expect(SortDirection).toBeDefined();
    expect(typeof SortDirection).toBe('object');
  });

  it('should have UserRoleEnum defined', () => {
    expect(UserRoleEnum).toBeDefined();
    expect(typeof UserRoleEnum).toBe('object');
  });

  it('should have UserStatusEnum defined', () => {
    expect(UserStatusEnum).toBeDefined();
    expect(typeof UserStatusEnum).toBe('object');
  });

  it('should export all required enums', () => {
    const enums = [FilterOperator, SortDirection, UserRoleEnum, UserStatusEnum];

    enums.forEach((enumType) => {
      expect(enumType).toBeDefined();
      expect(typeof enumType).toBe('object');
    });
  });
});
