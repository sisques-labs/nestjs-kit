# Vector value object (`VectorValueObject`)

`VectorValueObject` represents an immutable numeric vector — e.g. an **embedding** produced by an ML/RAG model — as a non-empty array of finite numbers. It bundles the common linear-algebra operations you need when working with embeddings or any other multi-dimensional numeric quantity: magnitude, normalization, dot product, cosine similarity, and Euclidean distance.

It extends [`ValueObject<number[]>`](../base/value-object.base.ts). The wrapped value is a plain `number[]`.

This value object is **storage-agnostic**: it doesn't know about pgvector, a specific embedding model, or any persistence mechanism. Map it to/from your database column (e.g. a `vector` column, a JSON array) at the infrastructure boundary.

---

## Import

```typescript
import { VectorValueObject } from '@sisques-labs/nestjs-kit';
import { InvalidVectorException } from '@sisques-labs/nestjs-kit';
```

Use `InvalidVectorException` when you need to catch or translate errors.

---

## Quick start

```typescript
const embedding = new VectorValueObject([0.12, -0.98, 0.44]);

console.log(embedding.dimensions); // 3
console.log(embedding.value); // [0.12, -0.98, 0.44]
```

**Pin an expected dimensionality** (e.g. to match your embedding model's output size):

```typescript
const embedding = new VectorValueObject(rawEmbedding, { dimensions: 1536 });
```

---

## Constructor

```typescript
new VectorValueObject(values: number[], options?: { dimensions?: number })
```

| Property | Type | Description |
|----------|------|-------------|
| `values` | `number[]` | The vector components. Must be non-empty. |
| `options.dimensions` | `number` | If set, the vector must have exactly this many components. |

### Validation

The constructor throws **`InvalidVectorException`** when:

- `values` is an **empty array**.
- Any component is **not a finite number** (`NaN`/`Infinity` included).
- `options.dimensions` is set and `values.length` doesn't match it.

---

## Instance API

| Member | Description |
|--------|-------------|
| `get value(): number[]` | A copy of the wrapped components. |
| `get dimensions(): number` | Number of components in the vector. |
| `toPrimitives(): number[]` | Plain array for persistence or APIs (equivalent to `value`). |
| `equals(other: VectorValueObject): boolean` | `true` if both vectors have the same dimensionality and every component is strictly equal. |
| `magnitude(): number` | Euclidean norm (`sqrt(sum(component^2))`). |
| `normalize(): VectorValueObject` | New unit-length vector in the same direction. Throws on a zero vector. |
| `dotProduct(other): number` | Dot (scalar) product. Throws if dimensions differ. |
| `euclideanDistance(other): number` | Euclidean distance between the two vectors. Throws if dimensions differ. |
| `cosineSimilarity(other): number` | Cosine similarity in `[-1, 1]`. Throws if dimensions differ or either vector is zero. |

Inherited from `ValueObject`: `toString()`, `isDefined()`, `isNullOrUndefined()`.

---

## Errors: `InvalidVectorException`

Thrown by the constructor and by any operation that requires matching dimensions or a non-zero vector. Example messages:

```text
Vector must not be empty
Vector component at index 1 must be a finite number
Vector must have exactly 1536 dimensions, got 512
Vector dimensions must match: 3 !== 2
Cannot normalize a zero vector
Cannot compute cosine similarity with a zero vector
```

---

## Example: ranking documents by similarity to a query embedding

```typescript
function rankBySimilarity(
  query: VectorValueObject,
  documents: { id: string; embedding: VectorValueObject }[],
) {
  return documents
    .map((doc) => ({ id: doc.id, score: query.cosineSimilarity(doc.embedding) }))
    .sort((a, b) => b.score - a.score);
}
```

---

## Extending for a fixed-dimension embedding type

```typescript
class TextEmbeddingVectorValueObject extends VectorValueObject {
  constructor(values: number[]) {
    super(values, { dimensions: 1536 });
  }
}
```

---

## Related types

- **Base class:** [`ValueObject`](../base/value-object.base.ts)
- **Exception:** `InvalidVectorException`
- **Tests:** `vector.vo.spec.ts` in this folder
