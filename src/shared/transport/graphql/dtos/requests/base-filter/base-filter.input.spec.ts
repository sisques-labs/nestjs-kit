import {
  Args,
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { isInputObjectType, isNonNullType } from 'graphql';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';

import { registerSharedGraphqlEnums } from '@/shared/transport/graphql/register-shared-graphql-enums';

import { BaseFilterInput } from './base-filter.input';

describe('BaseFilterInput', () => {
  it('should be defined', () => {
    expect(BaseFilterInput).toBeDefined();
  });

  it('should create a filter input with all properties', () => {
    const filter = new BaseFilterInput();
    filter.field = 'status';
    filter.operator = FilterOperator.EQUALS;
    filter.value = 'active';

    expect(filter.field).toBe('status');
    expect(filter.operator).toBe(FilterOperator.EQUALS);
    expect(filter.value).toBe('active');
  });

  it('should accept different filter operators', () => {
    const filter = new BaseFilterInput();
    filter.field = 'name';
    filter.operator = FilterOperator.LIKE;
    filter.value = 'test';

    expect(filter.operator).toBe(FilterOperator.LIKE);
  });

  it('should accept IN operator', () => {
    const filter = new BaseFilterInput();
    filter.field = 'id';
    filter.operator = FilterOperator.IN;
    filter.value = '123';

    expect(filter.operator).toBe(FilterOperator.IN);
  });

  it('should accept GREATER_THAN operator', () => {
    const filter = new BaseFilterInput();
    filter.field = 'age';
    filter.operator = FilterOperator.GREATER_THAN;
    filter.value = '18';

    expect(filter.operator).toBe(FilterOperator.GREATER_THAN);
  });

  it('should accept LESS_THAN operator', () => {
    const filter = new BaseFilterInput();
    filter.field = 'age';
    filter.operator = FilterOperator.LESS_THAN;
    filter.value = '65';

    expect(filter.operator).toBe(FilterOperator.LESS_THAN);
  });

  it('should accept GREATER_THAN_OR_EQUAL operator', () => {
    const filter = new BaseFilterInput();
    filter.field = 'age';
    filter.operator = FilterOperator.GREATER_THAN_OR_EQUAL;
    filter.value = '18';

    expect(filter.operator).toBe(FilterOperator.GREATER_THAN_OR_EQUAL);
  });

  it('should accept LESS_THAN_OR_EQUAL operator', () => {
    const filter = new BaseFilterInput();
    filter.field = 'age';
    filter.operator = FilterOperator.LESS_THAN_OR_EQUAL;
    filter.value = '65';

    expect(filter.operator).toBe(FilterOperator.LESS_THAN_OR_EQUAL);
  });

  it('should accept NOT_EQUALS operator', () => {
    const filter = new BaseFilterInput();
    filter.field = 'status';
    filter.operator = FilterOperator.NOT_EQUALS;
    filter.value = 'inactive';

    expect(filter.operator).toBe(FilterOperator.NOT_EQUALS);
  });

  it('should accept an array value (e.g. for the IN operator)', () => {
    const filter = new BaseFilterInput();
    filter.field = 'status';
    filter.operator = FilterOperator.IN;
    filter.value = ['ACTIVE', 'INACTIVE'];

    expect(filter.value).toEqual(['ACTIVE', 'INACTIVE']);
  });

  it('should accept a number value', () => {
    const filter = new BaseFilterInput();
    filter.field = 'age';
    filter.operator = FilterOperator.GREATER_THAN;
    filter.value = 18;

    expect(filter.value).toBe(18);
  });

  it('should accept a boolean value', () => {
    const filter = new BaseFilterInput();
    filter.field = 'isVerified';
    filter.operator = FilterOperator.EQUALS;
    filter.value = false;

    expect(filter.value).toBe(false);
  });

  describe('validation', () => {
    const validateFilter = (plain: Record<string, unknown>) =>
      validate(plainToInstance(BaseFilterInput, plain));

    it.each([FilterOperator.IS_NULL, FilterOperator.IS_NOT_NULL])(
      'accepts %s without a value',
      async (operator) => {
        const errors = await validateFilter({ field: 'deletedAt', operator });

        expect(errors).toHaveLength(0);
      },
    );

    it('accepts a null operator with a null value', async () => {
      const errors = await validateFilter({
        field: 'deletedAt',
        operator: FilterOperator.IS_NULL,
        value: null,
      });

      expect(errors).toHaveLength(0);
    });

    it('rejects EQUALS without a value', async () => {
      const errors = await validateFilter({
        field: 'status',
        operator: FilterOperator.EQUALS,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('value');
    });

    it('accepts EQUALS with a false value', async () => {
      const errors = await validateFilter({
        field: 'isVerified',
        operator: FilterOperator.EQUALS,
        value: false,
      });

      expect(errors).toHaveLength(0);
    });
  });

  describe('GraphQL schema', () => {
    @Resolver()
    class FilterProbeResolver {
      @Query(() => Boolean)
      probe(@Args('filter') _filter: BaseFilterInput): boolean {
        return true;
      }
    }

    const buildSchemaFields = async () => {
      registerSharedGraphqlEnums();
      const moduleRef = await Test.createTestingModule({
        imports: [GraphQLSchemaBuilderModule],
      }).compile();
      const schema = await moduleRef
        .get(GraphQLSchemaFactory)
        .create([FilterProbeResolver]);
      const inputType = schema.getType('BaseFilterInput');
      if (!isInputObjectType(inputType)) {
        throw new Error('BaseFilterInput is not an input object type');
      }

      return inputType.getFields();
    };

    it('exposes `value` as a nullable JSON field', async () => {
      const fields = await buildSchemaFields();

      expect(isNonNullType(fields.value.type)).toBe(false);
      expect(String(fields.value.type)).toBe('JSON');
    });

    it('keeps `field` and `operator` required', async () => {
      const fields = await buildSchemaFields();

      expect(String(fields.field.type)).toBe('String!');
      expect(String(fields.operator.type)).toBe('FilterOperator!');
    });
  });
});
