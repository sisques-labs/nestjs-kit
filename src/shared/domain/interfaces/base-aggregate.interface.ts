import { DateValueObject } from '@/shared/domain/value-objects/date/date.vo';
import { UuidValueObject } from '@/shared/domain/value-objects/uuid/uuid.vo';

/**
 * Base shape shared by every aggregate root.
 */
export interface IBaseAggregate {
  id: UuidValueObject;
  createdAt: DateValueObject;
  updatedAt: DateValueObject;
}
