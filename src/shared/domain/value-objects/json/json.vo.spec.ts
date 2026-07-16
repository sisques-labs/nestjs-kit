import { InvalidJsonException } from '@/shared/domain/exceptions/value-objects/invalid-json/invalid-json.exception';
import { JsonValueObject } from '@/shared/domain/value-objects/json/json.vo';

describe('JsonValueObject', () => {
  describe('constructor', () => {
    it('should create a JSON value object with valid object', () => {
      const json = new JsonValueObject({ key: 'value' });

      expect(json.value).toEqual({ key: 'value' });
    });

    it('should create a JSON value object from JSON string', () => {
      const json = new JsonValueObject('{"key":"value"}');

      expect(json.value).toEqual({ key: 'value' });
    });

    it('should create empty object when no value provided', () => {
      const json = new JsonValueObject();

      expect(json.value).toEqual({});
    });

    it('should throw InvalidJsonException for invalid JSON string', () => {
      expect(() => new JsonValueObject('invalid json')).toThrow(
        InvalidJsonException,
      );
    });

    it('should throw InvalidJsonException for array', () => {
      expect(() => new JsonValueObject([1, 2, 3] as any)).toThrow(
        InvalidJsonException,
      );
    });

    it('should throw InvalidJsonException when empty and allowEmpty is false', () => {
      expect(() => new JsonValueObject({}, { allowEmpty: false })).toThrow(
        InvalidJsonException,
      );
    });

    it('should throw InvalidJsonException when missing required keys', () => {
      expect(
        () =>
          new JsonValueObject(
            { key1: 'value1' },
            { requiredKeys: ['key1', 'key2'] },
          ),
      ).toThrow(InvalidJsonException);
    });

    it('should not throw when all required keys are present', () => {
      expect(
        () =>
          new JsonValueObject(
            { key1: 'value1', key2: 'value2' },
            { requiredKeys: ['key1', 'key2'] },
          ),
      ).not.toThrow();
    });

    it('should throw InvalidJsonException for a non-object primitive value', () => {
      expect(() => new JsonValueObject('42' as any)).toThrow(
        InvalidJsonException,
      );
      expect(() => new JsonValueObject(42 as any)).toThrow(
        InvalidJsonException,
      );
    });

    it('should throw InvalidJsonException when depth exceeds maxDepth', () => {
      expect(
        () => new JsonValueObject({ a: { b: { c: 'deep' } } }, { maxDepth: 1 }),
      ).toThrow(InvalidJsonException);
    });

    it('should not throw when depth is within maxDepth', () => {
      expect(
        () => new JsonValueObject({ a: { b: 'ok' } }, { maxDepth: 5 }),
      ).not.toThrow();
    });

    it('should throw InvalidJsonException for disallowed keys', () => {
      expect(
        () =>
          new JsonValueObject(
            { key1: 'value1', key2: 'value2' },
            { allowedKeys: ['key1'] },
          ),
      ).toThrow(InvalidJsonException);
    });

    it('should not throw when all keys are allowed', () => {
      expect(
        () =>
          new JsonValueObject({ key1: 'value1' }, { allowedKeys: ['key1'] }),
      ).not.toThrow();
    });

    it('should throw InvalidJsonException when schema validation fails', () => {
      expect(
        () =>
          new JsonValueObject(
            { key1: 'value1' },
            { schema: { key1: 'number' } },
          ),
      ).toThrow(InvalidJsonException);
    });

    it('should not throw when schema validation succeeds', () => {
      expect(
        () =>
          new JsonValueObject(
            { key1: 'value1', key2: [1, 2] },
            { schema: { key1: 'string', key2: 'array' } },
          ),
      ).not.toThrow();
    });
  });

  describe('equals', () => {
    it('should return true for equal JSON objects', () => {
      const json1 = new JsonValueObject({ key: 'value' });
      const json2 = new JsonValueObject({ key: 'value' });

      expect(json1.equals(json2)).toBe(true);
    });

    it('should return false for different JSON objects', () => {
      const json1 = new JsonValueObject({ key: 'value1' });
      const json2 = new JsonValueObject({ key: 'value2' });

      expect(json1.equals(json2)).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should check if JSON is empty', () => {
      expect(new JsonValueObject({}).isEmpty()).toBe(true);
      expect(new JsonValueObject({ key: 'value' }).isEmpty()).toBe(false);
    });

    it('should get value by key', () => {
      const json = new JsonValueObject({ key: 'value' });

      expect(json.get('key')).toBe('value');
      expect(json.get('nonexistent')).toBeUndefined();
    });

    it('should get value with default', () => {
      const json = new JsonValueObject({ key: 'value' });

      expect(json.getOrDefault('key', 'default')).toBe('value');
      expect(json.getOrDefault('nonexistent', 'default')).toBe('default');
    });

    it('should get all keys', () => {
      const json = new JsonValueObject({ key1: 'value1', key2: 'value2' });

      expect(json.keys()).toEqual(['key1', 'key2']);
    });

    it('should merge JSON objects', () => {
      const json1 = new JsonValueObject({ key1: 'value1' });
      const json2 = new JsonValueObject({ key2: 'value2' });

      const merged = json1.merge(json2);
      expect(merged.value).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should pick specified keys', () => {
      const json = new JsonValueObject({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });

      const picked = json.pick(['key1', 'key3']);
      expect(picked.value).toEqual({ key1: 'value1', key3: 'value3' });
    });

    it('should omit specified keys', () => {
      const json = new JsonValueObject({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });

      const omitted = json.omit(['key2']);
      expect(omitted.value).toEqual({ key1: 'value1', key3: 'value3' });
    });

    it('should convert to a JSON string', () => {
      const json = new JsonValueObject({ key: 'value' });

      expect(json.toString()).toBe('{"key":"value"}');
    });

    it('should convert to a pretty-printed JSON string', () => {
      const json = new JsonValueObject({ key: 'value' });

      expect(json.toString(true)).toBe(
        JSON.stringify({ key: 'value' }, null, 2),
      );
    });

    it('should check if JSON is not empty', () => {
      expect(new JsonValueObject({}).isNotEmpty()).toBe(false);
      expect(new JsonValueObject({ key: 'value' }).isNotEmpty()).toBe(true);
    });

    it('should get the size of the JSON', () => {
      expect(new JsonValueObject({ a: 1, b: 2 }).size()).toBe(2);
    });

    it('should check if a key exists', () => {
      const json = new JsonValueObject({ key: 'value' });

      expect(json.hasKey('key')).toBe(true);
      expect(json.hasKey('missing')).toBe(false);
    });

    it('should get all values', () => {
      const json = new JsonValueObject({ a: 1, b: 2 });

      expect(json.values()).toEqual([1, 2]);
    });

    it('should get all entries', () => {
      const json = new JsonValueObject({ a: 1, b: 2 });

      expect(json.entries()).toEqual([
        ['a', 1],
        ['b', 2],
      ]);
    });

    it('should deep merge nested JSON objects', () => {
      const json1 = new JsonValueObject({ a: { x: 1 }, b: 1 });
      const json2 = new JsonValueObject({ a: { y: 2 }, b: 2 });

      const merged = json1.merge(json2, true);

      expect(merged.value).toEqual({ a: { x: 1, y: 2 }, b: 2 });
    });

    it('should deep merge into a target without the nested key', () => {
      const json1 = new JsonValueObject({ b: 1 });
      const json2 = new JsonValueObject({ a: { y: 2 } });

      const merged = json1.merge(json2, true);

      expect(merged.value).toEqual({ a: { y: 2 }, b: 1 });
    });

    it('should transform key-value pairs', () => {
      const json = new JsonValueObject({ a: 1, b: 2 });

      const transformed = json.transform((key, value) => [
        key.toUpperCase(),
        value * 10,
      ]);

      expect(transformed.value).toEqual({ A: 10, B: 20 });
    });

    it('should filter key-value pairs by predicate', () => {
      const json = new JsonValueObject({ a: 1, b: 2, c: 3 });

      const filtered = json.filter((_key, value) => value > 1);

      expect(filtered.value).toEqual({ b: 2, c: 3 });
    });

    it('should validate against a schema', () => {
      const json = new JsonValueObject({ name: 'ok', tags: [1, 2] });

      expect(json.validateSchema({ name: 'string', tags: 'array' })).toBe(true);
      expect(json.validateSchema({ missing: 'string' })).toBe(false);
      expect(json.validateSchema(null as any)).toBe(false);
    });

    it('should get a nested value using dot notation', () => {
      const json = new JsonValueObject({ user: { profile: { name: 'Ada' } } });

      expect(json.getNested('user.profile.name')).toBe('Ada');
      expect(json.getNested('user.missing.name')).toBeUndefined();
    });

    it('should set a nested value using dot notation, creating intermediate objects', () => {
      const json = new JsonValueObject({ user: { profile: { name: 'Ada' } } });

      const updated = json.setNested('user.profile.age', 30);
      expect(updated.value).toEqual({
        user: { profile: { name: 'Ada', age: 30 } },
      });

      const created = new JsonValueObject({}).setNested('a.b.c', 'deep');
      expect(created.value).toEqual({ a: { b: { c: 'deep' } } });
    });

    it('should shallow clone the JSON object', () => {
      const json = new JsonValueObject({ a: 1 });

      const cloned = json.clone();

      expect(cloned.value).toEqual({ a: 1 });
      expect(cloned.value).not.toBe(json.value);
    });

    it('should deep clone the JSON object', () => {
      const json = new JsonValueObject({ a: { b: 1 } });

      const cloned = json.clone(true);

      expect(cloned.value).toEqual({ a: { b: 1 } });
      expect(cloned.value.a).not.toBe(json.value.a);
    });
  });
});
