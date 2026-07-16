import { InvalidStringException } from '@/shared/domain/exceptions/value-objects/invalid-string/invalid-string.exception';
import { SlugValueObject } from '@/shared/domain/value-objects/slug/slug.vo';

describe('SlugValueObject', () => {
  describe('constructor', () => {
    it('should create a slug value object with valid slug', () => {
      const slug = new SlugValueObject('test-slug');

      expect(slug.value).toBe('test-slug');
    });

    it('should generate slug from string when generateFromString is true', () => {
      const slug = new SlugValueObject('Test String', {
        generateFromString: true,
      });

      expect(slug.value).toBe('test-string');
    });

    it('should throw InvalidStringException for invalid slug format', () => {
      expect(() => new SlugValueObject('Invalid Slug!')).toThrow(
        InvalidStringException,
      );
    });

    it('should throw InvalidStringException for slug starting with hyphen', () => {
      expect(() => new SlugValueObject('-test-slug')).toThrow(
        InvalidStringException,
      );
    });

    it('should throw InvalidStringException for slug ending with hyphen', () => {
      expect(() => new SlugValueObject('test-slug-')).toThrow(
        InvalidStringException,
      );
    });

    it('should create a slug from string via fromString static factory', () => {
      const slug = SlugValueObject.fromString('Hello World');

      expect(slug).toBeInstanceOf(SlugValueObject);
      expect(slug.value).toBe('hello-world');
    });
  });

  describe('equals', () => {
    it('should return true for equal slugs', () => {
      const slug1 = new SlugValueObject('test-slug');
      const slug2 = new SlugValueObject('test-slug');

      expect(slug1.equals(slug2)).toBe(true);
    });

    it('should return false for different slugs', () => {
      const slug1 = new SlugValueObject('test-slug-1');
      const slug2 = new SlugValueObject('test-slug-2');

      expect(slug1.equals(slug2)).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should generate slug from string', () => {
      const slug = SlugValueObject.generateSlug('Test String Here');

      expect(slug).toBe('test-string-here');
    });

    it('should check if valid slug format', () => {
      expect(new SlugValueObject('test-slug').isValidSlug()).toBe(true);
    });

    it('should get word count', () => {
      const slug = new SlugValueObject('test-slug-here');

      expect(slug.getWordCount()).toBe(3);
    });

    it('should add suffix to slug', () => {
      const slug = new SlugValueObject('test-slug');
      const newSlug = slug.addSuffix('suffix');

      expect(newSlug.value).toBe('test-slug-suffix');
    });

    it('should add prefix to slug', () => {
      const slug = new SlugValueObject('test-slug');
      const newSlug = slug.addPrefix('prefix');

      expect(newSlug.value).toBe('prefix-test-slug');
    });

    it('should return an empty string for non-string or falsy input to generateSlug', () => {
      expect(SlugValueObject.generateSlug('')).toBe('');
      expect(SlugValueObject.generateSlug(undefined as any)).toBe('');
      expect(SlugValueObject.generateSlug(123 as any)).toBe('');
    });

    it('should strip non-alphanumeric characters and collapse hyphens', () => {
      expect(SlugValueObject.generateSlug('  Foo___Bar!! --- Baz  ')).toBe(
        'foo-bar-baz',
      );
    });

    it('should detect empty or hyphen-only slugs', () => {
      class ExposedSlug extends SlugValueObject {
        public checkEmptyOrOnlyHyphens(value: string): boolean {
          Object.defineProperty(this, 'value', { value, configurable: true });
          return this.isEmptyOrOnlyHyphens();
        }
      }

      const slug = new ExposedSlug('placeholder', { minLength: 0 });
      expect(slug.checkEmptyOrOnlyHyphens('')).toBe(true);
      expect(slug.checkEmptyOrOnlyHyphens('---')).toBe(true);
      expect(slug.checkEmptyOrOnlyHyphens('abc')).toBe(false);
    });

    it('should return zero word count for an empty slug value', () => {
      class ExposedSlug extends SlugValueObject {
        public wordCountOf(value: string): number {
          Object.defineProperty(this, 'value', {
            value,
            configurable: true,
          });
          return this.getWordCount();
        }
      }

      const slug = new ExposedSlug('placeholder', { minLength: 0 });
      expect(slug.wordCountOf('')).toBe(0);
    });

    it('should convert the slug to human-readable title case', () => {
      const slug = new SlugValueObject('hello-world-test');

      const humanReadable = slug.toHumanReadable();

      expect(humanReadable.value).toBe('Hello World Test');
    });

    it('should return the same instance when adding an empty-generating suffix', () => {
      const slug = new SlugValueObject('test-slug');

      expect(slug.addSuffix('!!!')).toBe(slug);
    });

    it('should return the same instance when adding an empty-generating prefix', () => {
      const slug = new SlugValueObject('test-slug');

      expect(slug.addPrefix('!!!')).toBe(slug);
    });

    it('should expose validateSlug for direct invocation by subclasses', () => {
      class ExposedSlug extends SlugValueObject {
        public runValidateSlugWith(value: string): void {
          Object.defineProperty(this, 'value', { value, configurable: true });
          (this as any).validateSlug();
        }
      }

      const slug = new ExposedSlug('valid-slug');

      expect(() => slug.runValidateSlugWith('valid-slug')).not.toThrow();
      expect(() => slug.runValidateSlugWith('---')).toThrow(
        InvalidStringException,
      );
      expect(() => slug.runValidateSlugWith('Invalid Slug!')).toThrow(
        InvalidStringException,
      );
    });
  });
});
