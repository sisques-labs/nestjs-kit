import { BaseAggregate } from '@/shared/domain/aggregates/base-aggregate/base.aggregate';
import { DateValueObject } from '@/shared/domain/value-objects/date/date.vo';

class TestAggregate extends BaseAggregate {}

describe('BaseAggregate', () => {
  it('exposes createdAt and updatedAt from the constructor', () => {
    const createdAt = new DateValueObject(new Date('2024-01-01T00:00:00.000Z'));
    const updatedAt = new DateValueObject(new Date('2024-01-02T00:00:00.000Z'));

    const aggregate = new TestAggregate(createdAt, updatedAt);

    expect(aggregate.createdAt).toBe(createdAt);
    expect(aggregate.updatedAt).toBe(updatedAt);
  });

  it('touch() replaces updatedAt with a new DateValueObject', () => {
    const createdAt = new DateValueObject(new Date('2024-01-01T00:00:00.000Z'));
    const updatedAt = new DateValueObject(new Date('2024-01-02T00:00:00.000Z'));

    const aggregate = new TestAggregate(createdAt, updatedAt);
    aggregate.touch();

    expect(aggregate.updatedAt).toBeInstanceOf(DateValueObject);
    expect(aggregate.updatedAt).not.toBe(updatedAt);
    expect(aggregate.createdAt).toBe(createdAt);
  });
});
