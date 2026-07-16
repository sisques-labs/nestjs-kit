import { InvalidFilenameException } from '@/shared/domain/exceptions/value-objects/invalid-filename/invalid-filename.exception';
import { FilenameValueObject } from '@/shared/domain/value-objects/filename/filename.vo';

describe('FilenameValueObject', () => {
  describe('constructor', () => {
    it('should create a filename value object with a valid value', () => {
      const filename = new FilenameValueObject('leaf.png');

      expect(filename.value).toBe('leaf.png');
    });

    it('should trim whitespace', () => {
      const filename = new FilenameValueObject('  leaf.png  ');

      expect(filename.value).toBe('leaf.png');
    });

    it('should throw InvalidFilenameException for an empty value', () => {
      expect(() => new FilenameValueObject('')).toThrow(
        InvalidFilenameException,
      );
      expect(() => new FilenameValueObject('   ')).toThrow(
        InvalidFilenameException,
      );
    });

    it('should throw InvalidFilenameException for "." or ".."', () => {
      expect(() => new FilenameValueObject('.')).toThrow(
        InvalidFilenameException,
      );
      expect(() => new FilenameValueObject('..')).toThrow(
        InvalidFilenameException,
      );
    });

    it('should throw InvalidFilenameException for path separators', () => {
      expect(() => new FilenameValueObject('../secrets.txt')).toThrow(
        InvalidFilenameException,
      );
      expect(() => new FilenameValueObject('dir/leaf.png')).toThrow(
        InvalidFilenameException,
      );
      expect(() => new FilenameValueObject('dir\\leaf.png')).toThrow(
        InvalidFilenameException,
      );
    });

    it('should throw InvalidFilenameException for a null byte', () => {
      expect(() => new FilenameValueObject('leaf.png\x00.jpg')).toThrow(
        InvalidFilenameException,
      );
    });

    it('should throw InvalidFilenameException for a value over 255 characters', () => {
      const longFilename = `${'a'.repeat(252)}.png`;

      expect(() => new FilenameValueObject(longFilename)).toThrow(
        InvalidFilenameException,
      );
    });
  });

  describe('equals', () => {
    it('should return true for equal filenames', () => {
      const a = new FilenameValueObject('leaf.png');
      const b = new FilenameValueObject('leaf.png');

      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different filenames', () => {
      const a = new FilenameValueObject('leaf.png');
      const b = new FilenameValueObject('flower.png');

      expect(a.equals(b)).toBe(false);
    });
  });

  describe('getExtension', () => {
    it('should return the lowercased extension', () => {
      expect(new FilenameValueObject('leaf.PNG').getExtension()).toBe('png');
    });

    it('should return an empty string when there is no extension', () => {
      expect(new FilenameValueObject('leaf').getExtension()).toBe('');
    });

    it('should return an empty string for a leading dot with no extension after', () => {
      expect(new FilenameValueObject('.gitignore').getExtension()).toBe('');
    });
  });
});
