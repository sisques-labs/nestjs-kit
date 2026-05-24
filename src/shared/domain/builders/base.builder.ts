import { FieldIsRequiredException } from '@/shared/domain/exceptions/field-is-required.exception';
import { IBuilder } from '@/shared/domain/interfaces/builders/base-builder.interface';

/**
 * Base class for fluent domain builders.
 *
 * Provides common fields (id, createdAt, updatedAt), fluent `with*` methods,
 * and default validation for those fields. Subclasses should override
 * {@link validate} to add entity-specific rules and call `super.validate()`.
 */
export abstract class BaseBuilder<TAggregate, TViewModel> implements IBuilder<
  TAggregate,
  TViewModel
> {
  protected _id!: string;
  protected _createdAt!: Date;
  protected _updatedAt!: Date;

  withId(id: string): this {
    this._id = id;
    return this;
  }

  withCreatedAt(createdAt: Date): this {
    this._createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): this {
    this._updatedAt = updatedAt;
    return this;
  }

  validate(): void {
    if (!this._id) {
      throw new FieldIsRequiredException('id');
    }
    if (this._createdAt == null) {
      throw new FieldIsRequiredException('createdAt');
    }
    if (this._updatedAt == null) {
      throw new FieldIsRequiredException('updatedAt');
    }
  }

  abstract build(): TAggregate;

  abstract buildViewModel(): TViewModel;
}
