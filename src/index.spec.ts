import * as Index from './index';

describe('index barrel', () => {
  it('re-exports key application classes', () => {
    expect(Index.BaseCommandHandler).toBeDefined();
    expect(Index.BaseUpdateCommandHandler).toBeDefined();
  });

  it('re-exports key domain classes', () => {
    expect(Index.BaseAggregate).toBeDefined();
    expect(Index.BaseBuilder).toBeDefined();
    expect(Index.PaginatedResult).toBeDefined();
    expect(Index.BaseViewModel).toBeDefined();
  });

  it('re-exports domain enums', () => {
    expect(Index.FilterOperator).toBeDefined();
    expect(Index.SortDirection).toBeDefined();
    expect(Index.LengthUnitEnum).toBeDefined();
    expect(Index.UserRoleEnum).toBeDefined();
    expect(Index.UserStatusEnum).toBeDefined();
  });

  it('re-exports domain exceptions', () => {
    expect(Index.BaseException).toBeDefined();
    expect(Index.FieldIsRequiredException).toBeDefined();
    expect(Index.InvalidEmailException).toBeDefined();
    expect(Index.InvalidUuidException).toBeDefined();
  });

  it('re-exports value objects', () => {
    expect(Index.ValueObject).toBeDefined();
    expect(Index.BooleanValueObject).toBeDefined();
    expect(Index.DateValueObject).toBeDefined();
    expect(Index.EmailValueObject).toBeDefined();
    expect(Index.UuidValueObject).toBeDefined();
    expect(Index.StringValueObject).toBeDefined();
  });

  it('re-exports infrastructure classes', () => {
    expect(Index.BaseDatabaseRepository).toBeDefined();
    expect(Index.BaseDatabaseMapper).toBeDefined();
  });
});
