import { InvalidStringException } from '@/shared/domain/exceptions/value-objects/invalid-string/invalid-string.exception';
import { PhoneCodeValueObject } from '@/shared/domain/value-objects/phone-code/phone-code.vo';

describe('PhoneCodeValueObject', () => {
  describe('constructor', () => {
    it('should create a phone code value object with valid phone code', () => {
      const phoneCode = new PhoneCodeValueObject('+34');

      expect(phoneCode.value).toBe('+34');
    });

    it('should throw InvalidStringException for invalid phone code format', () => {
      expect(() => new PhoneCodeValueObject('invalid')).toThrow(
        InvalidStringException,
      );
    });

    it('should normalize phone code by adding + if missing', () => {
      const phoneCode = new PhoneCodeValueObject('34', {
        validateExistence: false,
      });

      expect(phoneCode.value).toBe('+34');
    });

    it('should throw InvalidStringException for phone code not in common list', () => {
      expect(() => new PhoneCodeValueObject('+999')).toThrow(
        InvalidStringException,
      );
    });

    it('should skip existence validation when validateExistence is false', () => {
      expect(
        () => new PhoneCodeValueObject('+999', { validateExistence: false }),
      ).not.toThrow();
    });

    it('should skip existence validation for an empty value when allowEmpty is true', () => {
      const phoneCode = new PhoneCodeValueObject('', { allowEmpty: true });

      expect(phoneCode.value).toBe('');
    });

    it('should create a phone code via the fromString static factory', () => {
      const phoneCode = PhoneCodeValueObject.fromString('+34');

      expect(phoneCode).toBeInstanceOf(PhoneCodeValueObject);
      expect(phoneCode.value).toBe('+34');
    });
  });

  describe('normalizePhoneCode', () => {
    it('should return an empty string for falsy or non-string input', () => {
      expect(PhoneCodeValueObject.normalizePhoneCode('')).toBe('');
      expect(PhoneCodeValueObject.normalizePhoneCode(undefined as any)).toBe(
        '',
      );
      expect(PhoneCodeValueObject.normalizePhoneCode(123 as any)).toBe('');
    });

    it('should strip non-digit characters other than the leading +', () => {
      expect(PhoneCodeValueObject.normalizePhoneCode(' +3-4 (x) ')).toBe('+34');
    });
  });

  describe('equals', () => {
    it('should return true for equal phone codes', () => {
      const phoneCode1 = new PhoneCodeValueObject('+34');
      const phoneCode2 = new PhoneCodeValueObject('+34');

      expect(phoneCode1.equals(phoneCode2)).toBe(true);
    });

    it('should return false for different phone codes', () => {
      const phoneCode1 = new PhoneCodeValueObject('+34');
      const phoneCode2 = new PhoneCodeValueObject('+1');

      expect(phoneCode1.equals(phoneCode2)).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should check if phone code exists', () => {
      expect(new PhoneCodeValueObject('+34').exists()).toBe(true);
    });

    it('should get the numeric code without the + sign', () => {
      expect(new PhoneCodeValueObject('+34').getNumericCode()).toBe('34');
    });

    it('should get the full code with the + sign', () => {
      expect(new PhoneCodeValueObject('+34').getFullCode()).toBe('+34');
    });

    it('should check if the format is valid', () => {
      expect(new PhoneCodeValueObject('+34').isValidFormat()).toBe(true);
    });

    it('should check if the code is North American', () => {
      expect(new PhoneCodeValueObject('+1').isNorthAmerican()).toBe(true);
      expect(new PhoneCodeValueObject('+34').isNorthAmerican()).toBe(false);
    });

    it('should check if the code is European', () => {
      expect(new PhoneCodeValueObject('+34').isEuropean()).toBe(true);
      expect(new PhoneCodeValueObject('+1').isEuropean()).toBe(false);
    });

    it('should get the known region name for a code', () => {
      expect(new PhoneCodeValueObject('+34').getRegionName()).toBe('Spain');
    });

    it('should return null for an unknown region', () => {
      expect(
        new PhoneCodeValueObject('+999', {
          validateExistence: false,
        }).getRegionName(),
      ).toBeNull();
    });
  });
});
