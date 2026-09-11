import { KAFKA_MESSAGE_HANDLER_METADATA } from '../constants/messaging.constants';
import { KafkaMessageHandler } from './kafka-message-handler.decorator';

class DecoratedHandler {
  @KafkaMessageHandler({ topic: 'svc.orders', eventType: 'OrderCreated' })
  handleOrderCreated(): string {
    return 'handled';
  }

  @KafkaMessageHandler({ topic: 'svc.orders' })
  handleCatchAll(): void {}

  plain(): void {}
}

describe('KafkaMessageHandler decorator', () => {
  it('attaches routing metadata to the decorated method, readable via Reflector', () => {
    expect(
      Reflect.getMetadata(
        KAFKA_MESSAGE_HANDLER_METADATA,
        DecoratedHandler.prototype.handleOrderCreated,
      ),
    ).toEqual({ topic: 'svc.orders', eventType: 'OrderCreated' });
  });

  it('supports a catch-all handler with no eventType', () => {
    expect(
      Reflect.getMetadata(
        KAFKA_MESSAGE_HANDLER_METADATA,
        DecoratedHandler.prototype.handleCatchAll,
      ),
    ).toEqual({ topic: 'svc.orders' });
  });

  it('leaves an undecorated method without the metadata', () => {
    expect(
      Reflect.getMetadata(
        KAFKA_MESSAGE_HANDLER_METADATA,
        DecoratedHandler.prototype.plain,
      ),
    ).toBeUndefined();
  });

  it('does not alter the method runtime behavior when called directly', () => {
    const instance = new DecoratedHandler();

    expect(instance.handleOrderCreated()).toBe('handled');
  });
});
