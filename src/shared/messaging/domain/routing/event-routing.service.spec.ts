import { EventRoutingService, deriveAction } from './event-routing.service';

describe('EventRoutingService', () => {
  const map = {
    OrderAggregate: 'orders',
    InvoiceAggregate: 'billing',
  };
  const routing = new EventRoutingService(map);

  describe('resolveModule', () => {
    it('resolves a mapped aggregate root type', () => {
      expect(routing.resolveModule('OrderAggregate')).toEqual({
        module: 'orders',
        fallback: false,
      });
    });

    it('falls back to the unmapped module for unknown aggregate types', () => {
      expect(routing.resolveModule('SomethingNewAggregate')).toEqual({
        module: 'unmapped',
        fallback: true,
      });
    });
  });

  describe('deriveAction', () => {
    it.each([
      ['OrderCreatedEvent', 'order-created'],
      ['OrderUpdatedEvent', 'order-updated'],
      ['OrderStatusChangedEvent', 'order-status-changed'],
      ['UserCreationFailedEvent', 'user-creation-failed'],
      ['OAuthIdentityLinkedEvent', 'o-auth-identity-linked'],
    ])('kebab-cases %s -> %s', (eventType, expected) => {
      expect(deriveAction(eventType)).toBe(expected);
    });
  });
});
