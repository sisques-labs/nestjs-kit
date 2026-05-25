import { BaseDatabaseMapper } from '@/shared/infrastructure/database/mappers/base-database.mapper';

type StubAggregate = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

type StubPersistence = {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const CREATED_ISO = '2019-06-15T08:30:00.000Z';
const UPDATED_ISO = '2020-01-02T12:00:00.000Z';

class StubDatabaseMapper extends BaseDatabaseMapper<
  StubAggregate,
  StubPersistence
> {
  toAggregate(persistence: StubPersistence): StubAggregate {
    return {
      id: persistence.id,
      createdAt: this.normalizeDate(persistence.createdAt),
      updatedAt: this.normalizeDate(persistence.updatedAt),
    };
  }

  toPersistence(aggregate: StubAggregate): StubPersistence {
    return {
      id: aggregate.id,
      createdAt: aggregate.createdAt,
      updatedAt: aggregate.updatedAt,
    };
  }
}

describe('BaseDatabaseMapper', () => {
  let mapper: StubDatabaseMapper;

  beforeEach(() => {
    mapper = new StubDatabaseMapper();
  });

  describe('toAggregate', () => {
    it('normalizes string dates to Date instances', () => {
      const aggregate = mapper.toAggregate({
        id: 'entity-1',
        createdAt: CREATED_ISO,
        updatedAt: UPDATED_ISO,
      });

      expect(aggregate.id).toBe('entity-1');
      expect(aggregate.createdAt).toBeInstanceOf(Date);
      expect(aggregate.updatedAt).toBeInstanceOf(Date);
      expect(aggregate.createdAt.toISOString()).toBe(CREATED_ISO);
      expect(aggregate.updatedAt.toISOString()).toBe(UPDATED_ISO);
    });
  });

  describe('toPersistence', () => {
    it('maps aggregate fields onto the persistence shape', () => {
      const created = new Date('2022-05-05T10:00:00.000Z');
      const updated = new Date('2022-05-06T10:00:00.000Z');

      const persistence = mapper.toPersistence({
        id: 'agg-1',
        createdAt: created,
        updatedAt: updated,
      });

      expect(persistence.id).toBe('agg-1');
      expect(persistence.createdAt).toBe(created);
      expect(persistence.updatedAt).toBe(updated);
    });
  });

  describe('round-trip', () => {
    it('persistence → aggregate → persistence preserves identity and dates', () => {
      const persistence = {
        id: 'rt-1',
        createdAt: CREATED_ISO,
        updatedAt: UPDATED_ISO,
      };

      const aggregate = mapper.toAggregate(persistence);
      const back = mapper.toPersistence(aggregate);

      expect(back.id).toBe('rt-1');
      expect(back.createdAt).toEqual(aggregate.createdAt);
      expect(back.updatedAt).toEqual(aggregate.updatedAt);
    });
  });
});
