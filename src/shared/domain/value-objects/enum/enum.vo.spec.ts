import { InvalidEnumValueException } from '@/shared/domain/exceptions/value-objects/invalid-enum-value/invalid-enum-value.exception';
import { EnumValueObject } from '@/shared/domain/value-objects/enum/enum.vo';

// Test enum for testing EnumValueObject
enum TestEnum {
  VALUE1 = 'value1',
  VALUE2 = 'value2',
  VALUE3 = 'value3',
}

class TestEnumValueObject extends EnumValueObject<typeof TestEnum> {
  protected get enumObject(): typeof TestEnum {
    return TestEnum;
  }
}

describe('EnumValueObject', () => {
  describe('constructor', () => {
    it('should create an enum value object with valid enum value', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.value).toBe('value1');
    });

    it('should throw InvalidEnumValueException for empty string', () => {
      expect(() => new TestEnumValueObject('')).toThrow(
        InvalidEnumValueException,
      );
    });

    it('should throw InvalidEnumValueException for invalid enum value', () => {
      expect(() => new TestEnumValueObject('invalid')).toThrow(
        InvalidEnumValueException,
      );
    });
  });

  describe('equals', () => {
    it('should return true for equal enum values', () => {
      const enum1 = new TestEnumValueObject('value1');
      const enum2 = new TestEnumValueObject('value1');

      expect(enum1.equals(enum2)).toBe(true);
    });

    it('should return false for different enum values', () => {
      const enum1 = new TestEnumValueObject('value1');
      const enum2 = new TestEnumValueObject('value2');

      expect(enum1.equals(enum2)).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should check if value equals specific enum value', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.is('value1')).toBe(true);
      expect(enumVO.is('value2')).toBe(false);
    });

    it('should check if value is one of specified enum values', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.isOneOf(['value1', 'value2'])).toBe(true);
      expect(enumVO.isOneOf(['value2', 'value3'])).toBe(false);
    });

    it('should get enum key', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.getKey()).toBe('VALUE1');
    });

    it('should get all enum values', () => {
      const enumVO = new TestEnumValueObject('value1');

      const values = enumVO.getAllValues();
      expect(values).toContain('value1');
      expect(values).toContain('value2');
      expect(values).toContain('value3');
    });

    it('should check if value is valid', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.isValidValue('value1')).toBe(true);
      expect(enumVO.isValidValue('invalid')).toBe(false);
    });

    it('should check if value is not one of specified enum values', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.isNotOneOf(['value2', 'value3'])).toBe(true);
      expect(enumVO.isNotOneOf(['value1', 'value2'])).toBe(false);
    });

    it('should get all enum keys', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.getAllKeys()).toEqual(['VALUE1', 'VALUE2', 'VALUE3']);
    });

    it('should get all enum entries', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.getAllEntries()).toEqual([
        ['VALUE1', 'value1'],
        ['VALUE2', 'value2'],
        ['VALUE3', 'value3'],
      ]);
    });

    it('should get a random value from the enum', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(['value1', 'value2', 'value3']).toContain(enumVO.getRandomValue());
    });

    it('should get the next value in sequence', () => {
      expect(new TestEnumValueObject('value1').getNextValue()).toBe('value2');
      expect(new TestEnumValueObject('value3').getNextValue()).toBe('value1');
    });

    it('should get the previous value in sequence', () => {
      expect(new TestEnumValueObject('value2').getPreviousValue()).toBe(
        'value1',
      );
      expect(new TestEnumValueObject('value1').getPreviousValue()).toBe(
        'value3',
      );
    });

    it('should get the index of the current value', () => {
      expect(new TestEnumValueObject('value1').getIndex()).toBe(0);
      expect(new TestEnumValueObject('value3').getIndex()).toBe(2);
    });

    it('should get the total count of enum values', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.getCount()).toBe(3);
    });

    it('should convert to a human-readable display string', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.toDisplayString()).toBe('V A L U E1');
    });

    it('should convert to a slug representation', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.toSlug()).toBe('v-a-l-u-e1');
    });

    it('should convert to a constant representation', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.toConstant()).toBe('V_A_L_U_E1');
    });

    it('should create a new instance with a different value via withValue', () => {
      const enumVO = new TestEnumValueObject('value1');

      const other = enumVO.withValue('value2');

      expect(other).toBeInstanceOf(TestEnumValueObject);
      expect(other.value).toBe('value2');
    });

    it('should create a new instance with the next value', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.withNextValue().value).toBe('value2');
    });

    it('should create a new instance with the previous value', () => {
      const enumVO = new TestEnumValueObject('value2');

      expect(enumVO.withPreviousValue().value).toBe('value1');
    });

    it('should create a new instance with a random value', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(['value1', 'value2', 'value3']).toContain(
        enumVO.withRandomValue().value,
      );
    });

    it('should convert numeric-looking values to number', () => {
      enum NumericEnum {
        ONE = '1',
        TWO = '2',
      }
      class NumericEnumVO extends EnumValueObject<typeof NumericEnum> {
        protected get enumObject(): typeof NumericEnum {
          return NumericEnum;
        }
      }

      expect(new NumericEnumVO('1').toNumber()).toBe(1);
      expect(new NumericEnumVO('1').isNumeric()).toBe(true);
    });

    it('should report non-numeric values as not numeric', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.isNumeric()).toBe(false);
      expect(Number.isNaN(enumVO.toNumber())).toBe(true);
    });

    it('should get a description including the key', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(enumVO.getDescription()).toBe('TestEnumValueObject.VALUE1');
    });

    it('should serialize to JSON', () => {
      const enumVO = new TestEnumValueObject('value1');

      expect(JSON.parse(enumVO.toJSON())).toEqual({
        type: 'TestEnumValueObject',
        value: 'value1',
        key: 'VALUE1',
      });
    });

    it('should create an instance from a JSON string', () => {
      const enumVO = TestEnumValueObject.fromJSON(
        '{"value":"value2"}',
      ) as TestEnumValueObject;

      expect(enumVO).toBeInstanceOf(TestEnumValueObject);
      expect(enumVO.value).toBe('value2');
    });

    it('should create an instance from a JSON object', () => {
      const enumVO = TestEnumValueObject.fromJSON({
        value: 'value3',
      }) as TestEnumValueObject;

      expect(enumVO.value).toBe('value3');
    });

    it('should expose the protected enumValues getter to subclasses', () => {
      class ExposedEnumValueObject extends TestEnumValueObject {
        public get exposedEnumValues(): (string | number)[] {
          return this.enumValues;
        }
      }

      const enumVO = new ExposedEnumValueObject('value1');

      expect(enumVO.exposedEnumValues).toEqual(['value1', 'value2', 'value3']);
    });
  });
});
