import { InvalidVectorException } from '@/shared/domain/exceptions/value-objects/invalid-vector/invalid-vector.exception';
import { VectorValueObject } from '@/shared/domain/value-objects/vector/vector.vo';

describe('VectorValueObject', () => {
  describe('constructor', () => {
    it('should create with valid components', () => {
      const vo = new VectorValueObject([1, 2, 3]);

      expect(vo.value).toEqual([1, 2, 3]);
      expect(vo.dimensions).toBe(3);
    });

    it('should not be affected by mutations of the input array', () => {
      const input = [1, 2, 3];
      const vo = new VectorValueObject(input);
      input.push(4);

      expect(vo.value).toEqual([1, 2, 3]);
    });

    it('should throw when the array is empty', () => {
      expect(() => new VectorValueObject([])).toThrow(InvalidVectorException);
      expect(() => new VectorValueObject([])).toThrow(
        'Vector must not be empty',
      );
    });

    it('should throw when a component is not finite', () => {
      expect(() => new VectorValueObject([1, Infinity, 3])).toThrow(
        InvalidVectorException,
      );
      expect(() => new VectorValueObject([1, NaN, 3])).toThrow(
        'Vector component at index 1 must be a finite number',
      );
    });

    it('should enforce the dimensions option', () => {
      expect(() => new VectorValueObject([1, 2, 3], { dimensions: 4 })).toThrow(
        'Vector must have exactly 4 dimensions, got 3',
      );

      expect(
        () => new VectorValueObject([1, 2, 3, 4], { dimensions: 4 }),
      ).not.toThrow();
    });
  });

  describe('value and toPrimitives', () => {
    it('should return a copy of the components', () => {
      const vo = new VectorValueObject([1, 2, 3]);

      expect(vo.toPrimitives()).toEqual([1, 2, 3]);
      expect(vo.value).not.toBe(vo.value);
    });
  });

  describe('equals', () => {
    it('should return true for identical vectors', () => {
      const a = new VectorValueObject([1, 2, 3]);
      const b = new VectorValueObject([1, 2, 3]);

      expect(a.equals(b)).toBe(true);
    });

    it('should return false when a component differs', () => {
      const a = new VectorValueObject([1, 2, 3]);
      const b = new VectorValueObject([1, 2, 4]);

      expect(a.equals(b)).toBe(false);
    });

    it('should return false when dimensions differ', () => {
      const a = new VectorValueObject([1, 2, 3]);
      const b = new VectorValueObject([1, 2]);

      expect(a.equals(b)).toBe(false);
    });
  });

  describe('magnitude', () => {
    it('should compute the euclidean norm', () => {
      expect(new VectorValueObject([3, 4]).magnitude()).toBe(5);
      expect(new VectorValueObject([1, 0, 0]).magnitude()).toBe(1);
    });
  });

  describe('normalize', () => {
    it('should return a unit vector in the same direction', () => {
      const vo = new VectorValueObject([3, 4]);
      const normalized = vo.normalize();

      expect(normalized.value[0]).toBeCloseTo(0.6);
      expect(normalized.value[1]).toBeCloseTo(0.8);
      expect(normalized.magnitude()).toBeCloseTo(1);
    });

    it('should throw when normalizing a zero vector', () => {
      expect(() => new VectorValueObject([0, 0, 0]).normalize()).toThrow(
        'Cannot normalize a zero vector',
      );
    });
  });

  describe('dotProduct', () => {
    it('should compute the dot product', () => {
      const a = new VectorValueObject([1, 2, 3]);
      const b = new VectorValueObject([4, 5, 6]);

      expect(a.dotProduct(b)).toBe(32);
    });

    it('should throw when dimensions differ', () => {
      const a = new VectorValueObject([1, 2, 3]);
      const b = new VectorValueObject([1, 2]);

      expect(() => a.dotProduct(b)).toThrow(InvalidVectorException);
      expect(() => a.dotProduct(b)).toThrow(
        'Vector dimensions must match: 3 !== 2',
      );
    });
  });

  describe('euclideanDistance', () => {
    it('should compute the euclidean distance', () => {
      const a = new VectorValueObject([0, 0]);
      const b = new VectorValueObject([3, 4]);

      expect(a.euclideanDistance(b)).toBe(5);
    });

    it('should throw when dimensions differ', () => {
      const a = new VectorValueObject([1, 2, 3]);
      const b = new VectorValueObject([1, 2]);

      expect(() => a.euclideanDistance(b)).toThrow(InvalidVectorException);
    });
  });

  describe('cosineSimilarity', () => {
    it('should return 1 for identical direction vectors', () => {
      const a = new VectorValueObject([1, 2, 3]);
      const b = new VectorValueObject([2, 4, 6]);

      expect(a.cosineSimilarity(b)).toBeCloseTo(1);
    });

    it('should return 0 for orthogonal vectors', () => {
      const a = new VectorValueObject([1, 0]);
      const b = new VectorValueObject([0, 1]);

      expect(a.cosineSimilarity(b)).toBeCloseTo(0);
    });

    it('should return -1 for opposite vectors', () => {
      const a = new VectorValueObject([1, 0]);
      const b = new VectorValueObject([-1, 0]);

      expect(a.cosineSimilarity(b)).toBeCloseTo(-1);
    });

    it('should throw when dimensions differ', () => {
      const a = new VectorValueObject([1, 2, 3]);
      const b = new VectorValueObject([1, 2]);

      expect(() => a.cosineSimilarity(b)).toThrow(InvalidVectorException);
    });

    it('should throw when either vector is a zero vector', () => {
      const a = new VectorValueObject([0, 0]);
      const b = new VectorValueObject([1, 1]);

      expect(() => a.cosineSimilarity(b)).toThrow(
        'Cannot compute cosine similarity with a zero vector',
      );
    });
  });
});
