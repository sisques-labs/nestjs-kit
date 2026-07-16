import { InvalidTimezoneException } from '@/shared/domain/exceptions/value-objects/invalid-timezone/invalid-timezone.exception';
import { TimezoneValueObject } from '@/shared/domain/value-objects/timezone/timezone.vo';

describe('TimezoneValueObject', () => {
  describe('constructor', () => {
    it('should create a timezone value object with valid timezone', () => {
      const timezone = new TimezoneValueObject('Europe/Madrid');

      expect(timezone.value).toBe('Europe/Madrid');
    });

    it('should normalize timezone (trim only)', () => {
      const timezone = new TimezoneValueObject('  Europe/Madrid  ');

      expect(timezone.value).toBe('Europe/Madrid');
    });

    it('should throw InvalidTimezoneException for timezone not in common list', () => {
      expect(() => new TimezoneValueObject('Invalid/Timezone')).toThrow(
        InvalidTimezoneException,
      );
    });

    it('should skip existence validation when validateExistence is false', () => {
      expect(
        () =>
          new TimezoneValueObject('Invalid/Timezone', {
            validateExistence: false,
          }),
      ).not.toThrow();
    });

    it('should skip existence validation for an empty value when allowEmpty is true', () => {
      const timezone = new TimezoneValueObject('', { allowEmpty: true });

      expect(timezone.value).toBe('');
    });

    it('should create a timezone via the fromString static factory', () => {
      const timezone = TimezoneValueObject.fromString('UTC');

      expect(timezone).toBeInstanceOf(TimezoneValueObject);
      expect(timezone.value).toBe('UTC');
    });
  });

  describe('normalizeTimezone', () => {
    it('should return an empty string for falsy or non-string input', () => {
      expect(TimezoneValueObject.normalizeTimezone('')).toBe('');
      expect(TimezoneValueObject.normalizeTimezone(undefined as any)).toBe('');
      expect(TimezoneValueObject.normalizeTimezone(123 as any)).toBe('');
    });
  });

  describe('equals', () => {
    it('should return true for equal timezones', () => {
      const timezone1 = new TimezoneValueObject('Europe/Madrid');
      const timezone2 = new TimezoneValueObject('Europe/Madrid');

      expect(timezone1.equals(timezone2)).toBe(true);
    });

    it('should return false for different timezones', () => {
      const timezone1 = new TimezoneValueObject('Europe/Madrid');
      const timezone2 = new TimezoneValueObject('America/New_York');

      expect(timezone1.equals(timezone2)).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should check if timezone exists', () => {
      expect(new TimezoneValueObject('Europe/Madrid').exists()).toBe(true);
    });

    it('should get region from timezone', () => {
      const timezone = new TimezoneValueObject('Europe/Madrid');

      expect(timezone.getRegion()).toBe('Europe');
    });

    it('should get city from timezone', () => {
      const timezone = new TimezoneValueObject('Europe/Madrid');

      expect(timezone.getCity()).toBe('Madrid');
    });

    it('should check if timezone is European', () => {
      expect(new TimezoneValueObject('Europe/Madrid').isEuropean()).toBe(true);
      expect(new TimezoneValueObject('America/New_York').isEuropean()).toBe(
        false,
      );
    });

    it('should check if timezone is American', () => {
      expect(new TimezoneValueObject('America/New_York').isAmerican()).toBe(
        true,
      );
      expect(new TimezoneValueObject('Europe/Madrid').isAmerican()).toBe(false);
    });

    it('should check if timezone is Asian', () => {
      expect(new TimezoneValueObject('Asia/Tokyo').isAsian()).toBe(true);
      expect(new TimezoneValueObject('Europe/Madrid').isAsian()).toBe(false);
    });

    it('should check if timezone is UTC', () => {
      expect(new TimezoneValueObject('UTC').isUTC()).toBe(true);
      expect(new TimezoneValueObject('Europe/Madrid').isUTC()).toBe(false);
    });

    it('should return null region and city for a timezone without a region separator', () => {
      const timezone = new TimezoneValueObject('UTC');

      expect(timezone.getRegion()).toBeNull();
      expect(timezone.getCity()).toBeNull();
    });
  });
});
