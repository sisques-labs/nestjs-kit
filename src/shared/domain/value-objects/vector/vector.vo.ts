import { InvalidVectorException } from '@/shared/domain/exceptions/value-objects/invalid-vector/invalid-vector.exception';
import { ValueObject } from '@/shared/domain/value-objects/base/value-object.base';

/**
 * Vector Value Object
 *
 * Represents an immutable numeric vector (e.g. an embedding produced by an
 * ML/RAG model) as a non-empty array of finite numbers, with validation and
 * common linear-algebra utility methods (magnitude, normalization, dot
 * product, cosine similarity, euclidean distance).
 *
 * This value object is storage-agnostic: it does not know about pgvector,
 * a specific embedding model, or any persistence mechanism. Wrap it (or
 * subclass it) at the aggregate/infrastructure boundary if you need to
 * enforce a fixed dimensionality tied to a particular model.
 *
 * @remarks
 * - Throws {@link InvalidVectorException} if the array is empty, contains a
 *   non-finite value, or (when `options.dimensions` is set) has the wrong length.
 * - Operations that combine two vectors ({@link dotProduct}, {@link cosineSimilarity},
 *   {@link euclideanDistance}) throw {@link InvalidVectorException} when dimensions differ.
 *
 * @example
 * ```typescript
 * const a = new VectorValueObject([1, 0, 0]);
 * const b = new VectorValueObject([0, 1, 0]);
 * a.dotProduct(b); // 0
 * a.cosineSimilarity(b); // 0
 * a.magnitude(); // 1
 * ```
 */
export class VectorValueObject extends ValueObject<number[]> {
  /**
   * The encapsulated vector components.
   * @internal
   */
  private readonly _values: number[];

  /**
   * Constructs a new VectorValueObject.
   *
   * @param values - The vector components. Must be a non-empty array of finite numbers.
   * @param options - Optional constraints for validation.
   * @param options.dimensions - If set, the vector must have exactly this many components.
   *
   * @throws {@link InvalidVectorException} If validation fails.
   */
  constructor(
    values: number[],
    private readonly options: { dimensions?: number } = {},
  ) {
    super();
    this._values = [...values];
    this.validate();
  }

  /**
   * Gets the vector components.
   *
   * @returns A copy of the wrapped numeric array.
   */
  public get value(): number[] {
    return [...this._values];
  }

  /**
   * Gets the number of components (dimensionality) of the vector.
   */
  public get dimensions(): number {
    return this._values.length;
  }

  /**
   * Converts the vector to a plain, serializable array.
   *
   * @returns A copy of the wrapped numeric array.
   */
  public toPrimitives(): number[] {
    return [...this._values];
  }

  /**
   * Structural equality: two vectors are equal if they have the same
   * dimensionality and every component is strictly equal (`===`).
   *
   * @param other - Another VectorValueObject.
   * @returns `true` if both vectors are identical, else `false`.
   */
  public equals(other: VectorValueObject): boolean {
    if (this._values.length !== other._values.length) return false;
    return this._values.every((v, i) => v === other._values[i]);
  }

  /**
   * Computes the Euclidean norm (magnitude/length) of the vector.
   *
   * @returns The magnitude, i.e. `sqrt(sum(component^2))`.
   */
  public magnitude(): number {
    return Math.sqrt(this._values.reduce((sum, v) => sum + v * v, 0));
  }

  /**
   * Returns a new unit-length VectorValueObject pointing in the same direction.
   *
   * @throws {@link InvalidVectorException} If the vector is a zero vector (magnitude 0).
   */
  public normalize(): VectorValueObject {
    const magnitude = this.magnitude();
    if (magnitude === 0) {
      throw new InvalidVectorException('Cannot normalize a zero vector');
    }
    return new VectorValueObject(this._values.map((v) => v / magnitude));
  }

  /**
   * Computes the dot (scalar) product with another vector.
   *
   * @param other - Another VectorValueObject with the same dimensionality.
   * @throws {@link InvalidVectorException} If dimensions don't match.
   */
  public dotProduct(other: VectorValueObject): number {
    this.checkSameDimensions(other);
    return this._values.reduce((sum, v, i) => sum + v * other._values[i], 0);
  }

  /**
   * Computes the Euclidean distance to another vector.
   *
   * @param other - Another VectorValueObject with the same dimensionality.
   * @throws {@link InvalidVectorException} If dimensions don't match.
   */
  public euclideanDistance(other: VectorValueObject): number {
    this.checkSameDimensions(other);
    const sumOfSquares = this._values.reduce(
      (sum, v, i) => sum + (v - other._values[i]) ** 2,
      0,
    );
    return Math.sqrt(sumOfSquares);
  }

  /**
   * Computes the cosine similarity with another vector, in the range `[-1, 1]`.
   *
   * @param other - Another VectorValueObject with the same dimensionality.
   * @throws {@link InvalidVectorException} If dimensions don't match, or if
   *   either vector is a zero vector.
   */
  public cosineSimilarity(other: VectorValueObject): number {
    this.checkSameDimensions(other);
    const magnitudeProduct = this.magnitude() * other.magnitude();
    if (magnitudeProduct === 0) {
      throw new InvalidVectorException(
        'Cannot compute cosine similarity with a zero vector',
      );
    }
    return this.dotProduct(other) / magnitudeProduct;
  }

  /**
   * Ensures both vectors have the same dimensionality.
   *
   * @throws {@link InvalidVectorException} If dimensions don't match.
   * @internal
   */
  private checkSameDimensions(other: VectorValueObject): void {
    if (this._values.length !== other._values.length) {
      throw new InvalidVectorException(
        `Vector dimensions must match: ${this._values.length} !== ${other._values.length}`,
      );
    }
  }

  /**
   * Validates the vector against all configured constraints.
   *
   * @throws {@link InvalidVectorException} If any validation fails.
   * @internal
   */
  protected validate(): void {
    if (this._values.length === 0) {
      throw new InvalidVectorException('Vector must not be empty');
    }

    if (
      this.options.dimensions !== undefined &&
      this._values.length !== this.options.dimensions
    ) {
      throw new InvalidVectorException(
        `Vector must have exactly ${this.options.dimensions} dimensions, got ${this._values.length}`,
      );
    }

    this._values.forEach((v, i) => {
      if (typeof v !== 'number' || !isFinite(v)) {
        throw new InvalidVectorException(
          `Vector component at index ${i} must be a finite number`,
        );
      }
    });
  }
}
