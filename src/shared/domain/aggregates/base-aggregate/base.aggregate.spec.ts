import { BaseAggregate } from '@/shared/domain/aggregates/base-aggregate/base.aggregate';
import { BaseEvent } from '@/shared/domain/events/base-event.interface';
import { IEventMetadata } from '@/shared/domain/interfaces/event-metadata.interface';
import { DateValueObject } from '@/shared/domain/value-objects/date/date.vo';
import { UuidValueObject } from '@/shared/domain/value-objects/uuid/uuid.vo';

class TestEvent extends BaseEvent<{ test: string }> {
  constructor(metadata: IEventMetadata, data: { test: string }) {
    super(metadata, data);
  }
}

class TestAggregate extends BaseAggregate {
  constructor(
    id: UuidValueObject,
    createdAt: DateValueObject,
    updatedAt: DateValueObject,
  ) {
    super(id, createdAt, updatedAt);
  }

  raiseTestEvent(data: { test: string }): void {
    this.apply(new TestEvent(this.generateEventMetadata(TestEvent), data));
  }
}

describe('BaseAggregate', () => {
  const aggregateId = UuidValueObject.generate();
  const createdAt = new DateValueObject(new Date('2024-01-01T00:00:00.000Z'));
  const updatedAt = new DateValueObject(new Date('2024-01-02T00:00:00.000Z'));

  const createAggregate = () =>
    new TestAggregate(aggregateId, createdAt, updatedAt);

  it('exposes id, createdAt and updatedAt from the constructor', () => {
    const aggregate = createAggregate();

    expect(aggregate.id).toBe(aggregateId);
    expect(aggregate.createdAt).toBe(createdAt);
    expect(aggregate.updatedAt).toBe(updatedAt);
  });

  it('touch() replaces updatedAt with a new DateValueObject', () => {
    const aggregate = createAggregate();
    aggregate.touch();

    expect(aggregate.updatedAt).toBeInstanceOf(DateValueObject);
    expect(aggregate.updatedAt).not.toBe(updatedAt);
    expect(aggregate.createdAt).toBe(createdAt);
    expect(aggregate.id).toBe(aggregateId);
  });

  describe('generateEventMetadata', () => {
    it('builds metadata from the aggregate root', () => {
      const aggregate = createAggregate();

      const metadata = aggregate['generateEventMetadata'](TestEvent);

      expect(metadata).toEqual({
        aggregateRootId: aggregateId.value,
        aggregateRootType: 'TestAggregate',
        entityId: aggregateId.value,
        entityType: 'TestAggregate',
        eventType: 'TestEvent',
      });
    });

    it('forwards optional tracing metadata', () => {
      const aggregate = createAggregate();

      const metadata = aggregate['generateEventMetadata'](TestEvent, {
        schemaVersion: '2.0.0',
        correlationId: 'corr-1',
        causationId: 'cause-1',
      });

      expect(metadata).toEqual({
        aggregateRootId: aggregateId.value,
        aggregateRootType: 'TestAggregate',
        entityId: aggregateId.value,
        entityType: 'TestAggregate',
        eventType: 'TestEvent',
        schemaVersion: '2.0.0',
        correlationId: 'corr-1',
        causationId: 'cause-1',
      });
    });

    it('works with apply() to register domain events', () => {
      const aggregate = createAggregate();

      aggregate.raiseTestEvent({ test: 'test-value' });

      const [event] = aggregate.getUncommittedEvents() as TestEvent[];

      expect(event).toBeInstanceOf(TestEvent);
      expect(event.aggregateRootId).toBe(aggregateId.value);
      expect(event.eventType).toBe('TestEvent');
      expect(event.data).toEqual({ test: 'test-value' });
    });
  });
});
