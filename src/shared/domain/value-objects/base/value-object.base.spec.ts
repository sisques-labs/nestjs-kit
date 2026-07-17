import { ValueObject } from './value-object.base';

class TestStringVO extends ValueObject<string> {
  private readonly _value: string;

  constructor(value: string) {
    super();
    this._value = value;
    this.validate();
  }

  get value(): string {
    return this._value;
  }

  protected validate(): void {
    if (!this._value) throw new Error('Value cannot be empty');
  }
}

class TestObjectVO extends ValueObject<{ x: number; y: number }> {
  private readonly _value: { x: number; y: number };

  constructor(x: number, y: number) {
    super();
    this._value = { x, y };
    this.validate();
  }

  get value() {
    return this._value;
  }

  protected validate(): void {}
}

/** Composite VO: multiple private attributes aggregated into `value` (e.g. prompt body + variables). */
class TestCompositeVO extends ValueObject<{
  content: string;
  variables: Record<string, string>;
}> {
  private readonly _content: string;
  private readonly _variables: Readonly<Record<string, string>>;

  constructor(content: string, variables: Record<string, string>) {
    super();
    this._content = content;
    this._variables = { ...variables };
    this.validate();
  }

  get value() {
    return {
      content: this._content,
      variables: { ...this._variables },
    };
  }

  protected validate(): void {
    if (!this._content.trim()) throw new Error('content cannot be empty');
  }
}

class TestCustomEqualityVO extends ValueObject<{ tags: string[] }> {
  private readonly _tags: readonly string[];

  constructor(tags: string[]) {
    super();
    this._tags = [...tags];
    this.validate();
  }

  get value() {
    return { tags: [...this._tags] };
  }

  protected validate(): void {}

  protected valuesAreEqual(
    a: { tags: string[] },
    b: { tags: string[] },
  ): boolean {
    if (a.tags.length !== b.tags.length) return false;
    const sortedA = [...a.tags].sort();
    const sortedB = [...b.tags].sort();
    return sortedA.every((t, i) => t === sortedB[i]);
  }
}

describe('ValueObject', () => {
  describe('equals', () => {
    it('returns true for same primitive value', () => {
      expect(new TestStringVO('hello').equals(new TestStringVO('hello'))).toBe(
        true,
      );
    });

    it('returns false for different primitive value', () => {
      expect(new TestStringVO('hello').equals(new TestStringVO('world'))).toBe(
        false,
      );
    });

    it('returns true for same object value', () => {
      expect(new TestObjectVO(1, 2).equals(new TestObjectVO(1, 2))).toBe(true);
    });

    it('returns false for different object value', () => {
      expect(new TestObjectVO(1, 2).equals(new TestObjectVO(1, 3))).toBe(false);
    });

    it('returns true for composite value objects with same attributes', () => {
      const a = new TestCompositeVO('Hello', { name: 'Ada' });
      const b = new TestCompositeVO('Hello', { name: 'Ada' });
      expect(a.equals(b)).toBe(true);
    });

    it('returns false when composite attributes differ', () => {
      const a = new TestCompositeVO('Hello', { name: 'Ada' });
      const b = new TestCompositeVO('Hello', { name: 'Bob' });
      expect(a.equals(b)).toBe(false);
    });

    it('uses valuesAreEqual when overridden (order-insensitive tags)', () => {
      const a = new TestCustomEqualityVO(['b', 'a']);
      const b = new TestCustomEqualityVO(['a', 'b']);
      expect(a.equals(b)).toBe(true);
    });

    it('returns false when compared to a non-ValueObject', () => {
      const a = new TestStringVO('hello');
      expect(a.equals({ value: 'hello' } as any)).toBe(false);
    });
  });

  describe('toPrimitives', () => {
    it('returns the raw value for primitives', () => {
      expect(new TestStringVO('hello').toPrimitives()).toBe('hello');
    });

    it('returns a deep copy for objects', () => {
      const vo = new TestObjectVO(1, 2);
      const primitives = vo.toPrimitives();
      expect(primitives).toEqual({ x: 1, y: 2 });
      expect(primitives).not.toBe(vo.value);
    });

    it('deep-copies nested object attributes on composite VOs', () => {
      const vo = new TestCompositeVO('Hi', { k: 'v' });
      const p = vo.toPrimitives();
      expect(p).toEqual({ content: 'Hi', variables: { k: 'v' } });
      expect(p.variables).not.toBe(vo.value.variables);
    });

    it('returns null/undefined unchanged without attempting to clone', () => {
      class NullableVO extends ValueObject<string | null> {
        constructor(private readonly _value: string | null) {
          super();
          this.validate();
        }
        get value() {
          return this._value;
        }
        protected validate(): void {}
      }

      expect(new NullableVO(null).toPrimitives()).toBeNull();
    });
  });

  describe('toString', () => {
    it('returns string representation', () => {
      expect(new TestStringVO('hello').toString()).toBe('hello');
    });

    it('returns JSON for objects', () => {
      expect(new TestObjectVO(1, 2).toString()).toBe('{"x":1,"y":2}');
    });

    it('returns an empty string for null/undefined values', () => {
      class NullableVO extends ValueObject<string | null> {
        constructor(private readonly _value: string | null) {
          super();
          this.validate();
        }
        get value() {
          return this._value;
        }
        protected validate(): void {}
      }

      expect(new NullableVO(null).toString()).toBe('');
    });
  });

  describe('isDefined', () => {
    it('returns true for defined values', () => {
      expect(new TestStringVO('hello').isDefined()).toBe(true);
    });
  });

  describe('isNullOrUndefined', () => {
    it('returns false for defined values', () => {
      expect(new TestStringVO('hello').isNullOrUndefined()).toBe(false);
    });

    it('returns true for null values', () => {
      class NullableVO extends ValueObject<string | null> {
        constructor(private readonly _value: string | null) {
          super();
          this.validate();
        }
        get value() {
          return this._value;
        }
        protected validate(): void {}
      }

      expect(new NullableVO(null).isNullOrUndefined()).toBe(true);
    });
  });

  describe('validate enforcement', () => {
    it('throws when validation fails', () => {
      expect(() => new TestStringVO('')).toThrow('Value cannot be empty');
    });

    it('validates composite VOs using aggregate rules', () => {
      expect(() => new TestCompositeVO('   ', {})).toThrow(
        'content cannot be empty',
      );
    });
  });
});
