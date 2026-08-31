import { IEventMetadata } from '@/shared/domain/interfaces/event-metadata.interface';
import { DateValueObject } from '@/shared/domain/value-objects/date/date.vo';
import { UuidValueObject } from '@/shared/domain/value-objects/uuid/uuid.vo';
import { AggregateRoot } from '@nestjs/cqrs';

export class BaseAggregate extends AggregateRoot {
  protected readonly _id: UuidValueObject;
  protected readonly _createdAt: DateValueObject;
  protected _updatedAt: DateValueObject;

  constructor(
    id: UuidValueObject,
    createdAt: DateValueObject,
    updatedAt: DateValueObject,
  ) {
    super();
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  /**
   * Get the id of the aggregate.
   */
  public get id(): UuidValueObject {
    return this._id;
  }

  /**
   * Get the created at of the aggregate.
   *
   * @returns The created at of the aggregate.
   */
  public get createdAt(): DateValueObject {
    return this._createdAt;
  }

  /**
   * Get the updated at of the aggregate.
   *
   * @returns The updated at of the aggregate.
   */
  public get updatedAt(): DateValueObject {
    return this._updatedAt;
  }

  /**
   * Touch the aggregate.
   *
   * This method is used to update the updated at of the aggregate.
   */
  public touch(): void {
    this._updatedAt = new DateValueObject(new Date());
  }

  /**
   * Builds event metadata for the aggregate root.
   *
   * @param EventClass - The domain event class constructor.
   * @param options - Optional tracing and schema version metadata.
   */
  protected generateEventMetadata(
    EventClass: { name: string },
    options?: Pick<
      IEventMetadata,
      'schemaVersion' | 'correlationId' | 'causationId'
    >,
  ): IEventMetadata {
    const aggregateType = this.constructor.name;

    return {
      aggregateRootId: this.id.value,
      aggregateRootType: aggregateType,
      entityId: this.id.value,
      entityType: aggregateType,
      eventType: EventClass.name,
      ...options,
    };
  }
}
