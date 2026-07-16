import { InvalidMimeTypeException } from '@/shared/domain/exceptions/value-objects/invalid-mime-type/invalid-mime-type.exception';
import { MimeTypeValueObject } from '@/shared/domain/value-objects/mime-type/mime-type.vo';

describe('MimeTypeValueObject', () => {
  describe('constructor', () => {
    it('should create a mime type value object with a valid value', () => {
      const mimeType = new MimeTypeValueObject('image/png');

      expect(mimeType.value).toBe('image/png');
    });

    it('should normalize the value to lowercase', () => {
      const mimeType = new MimeTypeValueObject('IMAGE/PNG');

      expect(mimeType.value).toBe('image/png');
    });

    it('should trim whitespace', () => {
      const mimeType = new MimeTypeValueObject('  image/png  ');

      expect(mimeType.value).toBe('image/png');
    });

    it('should accept subtypes with +, -, . and digits', () => {
      expect(new MimeTypeValueObject('application/vnd.api+json').value).toBe(
        'application/vnd.api+json',
      );
      expect(new MimeTypeValueObject('font/woff2').value).toBe('font/woff2');
    });

    it('should throw InvalidMimeTypeException for an empty value', () => {
      expect(() => new MimeTypeValueObject('')).toThrow(
        InvalidMimeTypeException,
      );
    });

    it('should throw InvalidMimeTypeException when there is no slash', () => {
      expect(() => new MimeTypeValueObject('image')).toThrow(
        InvalidMimeTypeException,
      );
    });

    it('should throw InvalidMimeTypeException when type or subtype is missing', () => {
      expect(() => new MimeTypeValueObject('/png')).toThrow(
        InvalidMimeTypeException,
      );
      expect(() => new MimeTypeValueObject('image/')).toThrow(
        InvalidMimeTypeException,
      );
    });

    it('should throw InvalidMimeTypeException for a value over 255 characters', () => {
      const longMimeType = `image/${'a'.repeat(250)}`;

      expect(() => new MimeTypeValueObject(longMimeType)).toThrow(
        InvalidMimeTypeException,
      );
    });
  });

  describe('equals', () => {
    it('should return true for equal mime types', () => {
      const a = new MimeTypeValueObject('image/png');
      const b = new MimeTypeValueObject('IMAGE/PNG');

      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different mime types', () => {
      const a = new MimeTypeValueObject('image/png');
      const b = new MimeTypeValueObject('image/webp');

      expect(a.equals(b)).toBe(false);
    });
  });

  describe('getType / getSubtype', () => {
    it('should return the type and subtype parts', () => {
      const mimeType = new MimeTypeValueObject('image/png');

      expect(mimeType.getType()).toBe('image');
      expect(mimeType.getSubtype()).toBe('png');
    });
  });
});
