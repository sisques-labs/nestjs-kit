import { BadRequestException } from '@nestjs/common';

import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';
import { FilterFieldRegistry } from '@/shared/domain/interfaces/criteria/filter-field-registry.interface';

import { FilterValidationPipe } from './filter-validation.pipe';

enum TestStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

const registry: FilterFieldRegistry = {
  name: { type: 'string' },
  age: { type: 'number' },
  isVerified: { type: 'boolean' },
  ownerId: { type: 'uuid' },
  createdAt: { type: 'date' },
  status: { type: 'enum', enum: TestStatus },
};

describe('FilterValidationPipe', () => {
  it('should be defined', () => {
    expect(new FilterValidationPipe(registry)).toBeDefined();
  });

  it('passes input through unchanged when there are no filters', () => {
    const pipe = new FilterValidationPipe(registry);
    const input = { filters: [] };

    expect(pipe.transform(input)).toBe(input);
  });

  it('passes input through unchanged when filters is undefined', () => {
    const pipe = new FilterValidationPipe(registry);
    const input = {};

    expect(pipe.transform(input)).toBe(input);
  });

  it('throws for an unknown filter field', () => {
    const pipe = new FilterValidationPipe(registry);
    const input = {
      filters: [
        { field: 'password', operator: FilterOperator.EQUALS, value: 'x' },
      ],
    };

    expect(() => pipe.transform(input)).toThrow(BadRequestException);
    expect(() => pipe.transform(input)).toThrow(
      /Unknown filter field: "password"/,
    );
  });

  it.each([
    ['string', 'name', 'rose'],
    ['number', 'age', 3],
    ['boolean', 'isVerified', true],
    ['uuid', 'ownerId', 'a3f1b2c4-0000-4000-8000-000000000000'],
    ['date', 'createdAt', '2026-01-01T00:00:00.000Z'],
    ['enum', 'status', TestStatus.ACTIVE],
  ])('accepts a valid %s value', (_type, field, value) => {
    const pipe = new FilterValidationPipe(registry);
    const input = {
      filters: [{ field, operator: FilterOperator.EQUALS, value }],
    };

    expect(() => pipe.transform(input)).not.toThrow();
  });

  it('rejects a number where a string is expected', () => {
    const pipe = new FilterValidationPipe(registry);
    const input = {
      filters: [{ field: 'name', operator: FilterOperator.EQUALS, value: 42 }],
    };

    expect(() => pipe.transform(input)).toThrow(BadRequestException);
  });

  it('rejects a malformed date string', () => {
    const pipe = new FilterValidationPipe(registry);
    const input = {
      filters: [
        {
          field: 'createdAt',
          operator: FilterOperator.EQUALS,
          value: 'not-a-date',
        },
      ],
    };

    expect(() => pipe.transform(input)).toThrow(BadRequestException);
  });

  it('rejects a value not in the enum', () => {
    const pipe = new FilterValidationPipe(registry);
    const input = {
      filters: [
        { field: 'status', operator: FilterOperator.EQUALS, value: 'DELETED' },
      ],
    };

    expect(() => pipe.transform(input)).toThrow(BadRequestException);
    expect(() => pipe.transform(input)).toThrow(
      /expected one of: ACTIVE, INACTIVE/,
    );
  });

  it('validates every element of an array value for the IN operator', () => {
    const pipe = new FilterValidationPipe(registry);
    const input = {
      filters: [
        {
          field: 'status',
          operator: FilterOperator.IN,
          value: [TestStatus.ACTIVE, 'DELETED'],
        },
      ],
    };

    expect(() => pipe.transform(input)).toThrow(BadRequestException);
  });

  it('accepts an IN filter when every array element is valid', () => {
    const pipe = new FilterValidationPipe(registry);
    const input = {
      filters: [
        {
          field: 'status',
          operator: FilterOperator.IN,
          value: [TestStatus.ACTIVE, TestStatus.INACTIVE],
        },
      ],
    };

    expect(() => pipe.transform(input)).not.toThrow();
  });

  it('wraps a non-array IN value into a single-element array before validating', () => {
    const pipe = new FilterValidationPipe(registry);
    const input = {
      filters: [
        {
          field: 'status',
          operator: FilterOperator.IN,
          value: TestStatus.ACTIVE,
        },
      ],
    };

    expect(() => pipe.transform(input)).not.toThrow();
  });

  it('validates every filter in a multi-filter input', () => {
    const pipe = new FilterValidationPipe(registry);
    const input = {
      filters: [
        { field: 'name', operator: FilterOperator.LIKE, value: 'rose' },
        {
          field: 'age',
          operator: FilterOperator.GREATER_THAN,
          value: 'not-a-number',
        },
      ],
    };

    expect(() => pipe.transform(input)).toThrow(BadRequestException);
  });

  describe('null operators', () => {
    it.each([FilterOperator.IS_NULL, FilterOperator.IS_NOT_NULL])(
      'accepts %s without a value',
      (operator) => {
        const pipe = new FilterValidationPipe(registry);
        const input = { filters: [{ field: 'createdAt', operator }] };

        expect(pipe.transform(input)).toBe(input);
      },
    );

    it('ignores a value supplied with a null operator', () => {
      const pipe = new FilterValidationPipe(registry);
      const input = {
        filters: [
          {
            field: 'age',
            operator: FilterOperator.IS_NULL,
            value: 'not-a-number',
          },
        ],
      };

      expect(() => pipe.transform(input)).not.toThrow();
    });

    it('still rejects a null operator on an unknown field', () => {
      const pipe = new FilterValidationPipe(registry);
      const input = {
        filters: [{ field: 'password', operator: FilterOperator.IS_NULL }],
      };

      expect(() => pipe.transform(input)).toThrow(
        /Unknown filter field: "password"/,
      );
    });
  });

  describe('missing value', () => {
    it.each([
      ['undefined', undefined],
      ['null', null],
    ])('rejects EQUALS with a %s value', (_label, value) => {
      const pipe = new FilterValidationPipe(registry);
      const input = {
        filters: [{ field: 'name', operator: FilterOperator.EQUALS, value }],
      };

      expect(() => pipe.transform(input)).toThrow(BadRequestException);
      expect(() => pipe.transform(input)).toThrow(
        'Missing value for filter field "name" with operator "eq"',
      );
    });

    it('still accepts a false value for a boolean field', () => {
      const pipe = new FilterValidationPipe(registry);
      const input = {
        filters: [
          {
            field: 'isVerified',
            operator: FilterOperator.EQUALS,
            value: false,
          },
        ],
      };

      expect(() => pipe.transform(input)).not.toThrow();
    });
  });
});
