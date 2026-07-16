import { AggregateRoot, EventBus } from '@nestjs/cqrs';

import { BaseCommandHandler } from '@/shared/application/commands/base/base-command.handler';

interface TestCommand {
  id: string;
}

class TestAggregate extends AggregateRoot {}

class TestCommandHandler extends BaseCommandHandler<
  TestCommand,
  TestAggregate
> {
  constructor(eventBus: EventBus) {
    super(eventBus);
  }

  public async publishEventsPublic(aggregate: TestAggregate): Promise<void> {
    return this.publishEvents(aggregate);
  }
}

describe('BaseCommandHandler', () => {
  let handler: TestCommandHandler;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockEventBus = {
      publish: jest.fn(),
      publishAll: jest.fn(),
    } as unknown as jest.Mocked<EventBus>;

    handler = new TestCommandHandler(mockEventBus);
  });

  describe('publishEvents', () => {
    it('publishes every uncommitted event via the event bus', async () => {
      const aggregate = new TestAggregate();
      const events = [{ type: 'created' }, { type: 'updated' }];
      jest.spyOn(aggregate, 'getUncommittedEvents').mockReturnValue(events);
      jest.spyOn(aggregate, 'commit');

      await handler.publishEventsPublic(aggregate);

      expect(mockEventBus.publishAll).toHaveBeenCalledWith(events);
      expect(aggregate.commit).toHaveBeenCalled();
    });

    it('commits the aggregate even when there are no uncommitted events', async () => {
      const aggregate = new TestAggregate();
      jest.spyOn(aggregate, 'getUncommittedEvents').mockReturnValue([]);
      jest.spyOn(aggregate, 'commit');

      await handler.publishEventsPublic(aggregate);

      expect(mockEventBus.publishAll).toHaveBeenCalledWith([]);
      expect(aggregate.commit).toHaveBeenCalled();
    });
  });
});
