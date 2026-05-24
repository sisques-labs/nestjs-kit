import { BaseBuilder } from '@/shared/domain/builders/base.builder';
import { FieldIsRequiredException } from '@/shared/domain/exceptions/field-is-required.exception';

class TestBuilder extends BaseBuilder<object, object> {
  build(): object {
    this.validate();
    return {};
  }

  buildViewModel(): object {
    this.validate();
    return {};
  }
}

describe('BaseBuilder', () => {
  let builder: TestBuilder;

  beforeEach(() => {
    builder = new TestBuilder();
  });

  describe('validate', () => {
    it('should throw when id is missing', () => {
      builder
        .withCreatedAt(new Date())
        .withUpdatedAt(new Date());

      expect(() => builder.validate()).toThrow(FieldIsRequiredException);
      expect(() => builder.validate()).toThrow(/id/);
    });

    it('should throw when createdAt is missing', () => {
      builder.withId('id').withUpdatedAt(new Date());

      expect(() => builder.validate()).toThrow(FieldIsRequiredException);
      expect(() => builder.validate()).toThrow(/createdAt/);
    });

    it('should throw when updatedAt is missing', () => {
      builder.withId('id').withCreatedAt(new Date());

      expect(() => builder.validate()).toThrow(FieldIsRequiredException);
      expect(() => builder.validate()).toThrow(/updatedAt/);
    });

    it('should not throw when id, createdAt and updatedAt are set', () => {
      builder
        .withId('id')
        .withCreatedAt(new Date())
        .withUpdatedAt(new Date());

      expect(() => builder.validate()).not.toThrow();
    });
  });

  describe('build', () => {
    it('should call validate before building', () => {
      expect(() => builder.build()).toThrow(FieldIsRequiredException);
    });
  });

  describe('buildViewModel', () => {
    it('should call validate before building', () => {
      expect(() => builder.buildViewModel()).toThrow(FieldIsRequiredException);
    });
  });
});
