import { BaseTypeOrmMapper } from '@/shared/infrastructure/database/typeorm/mappers/base-typeorm.mapper';
import { BaseTypeormEntity } from '@/shared/infrastructure/database/typeorm/entities/base-typeorm.entity';

type StubAggregate = {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

class StubTypeormEntity extends BaseTypeormEntity {
  status: string;
}

const CREATED_ISO = '2019-06-15T08:30:00.000Z';
const UPDATED_ISO = '2020-01-02T12:00:00.000Z';

class StubTypeOrmMapper extends BaseTypeOrmMapper<
  StubAggregate,
  StubTypeormEntity
> {
  toAggregate(entity: StubTypeormEntity): StubAggregate {
    return {
      id: entity.id,
      status: entity.status,
      createdAt: this.normalizeDate(entity.createdAt),
      updatedAt: this.normalizeDate(entity.updatedAt),
    };
  }

  toEntity(aggregate: StubAggregate): StubTypeormEntity {
    const entity = new StubTypeormEntity();

    entity.id = aggregate.id;
    entity.status = aggregate.status;
    entity.createdAt = aggregate.createdAt;
    entity.updatedAt = aggregate.updatedAt;

    return entity;
  }
}

describe('BaseTypeOrmMapper', () => {
  let mapper: StubTypeOrmMapper;

  beforeEach(() => {
    mapper = new StubTypeOrmMapper();
  });

  describe('toAggregate', () => {
    it('maps entity fields to an aggregate', () => {
      const entity = new StubTypeormEntity();
      entity.id = 'user-1';
      entity.status = 'ACTIVE';
      entity.createdAt = new Date(CREATED_ISO);
      entity.updatedAt = new Date(UPDATED_ISO);

      const aggregate = mapper.toAggregate(entity);

      expect(aggregate.id).toBe('user-1');
      expect(aggregate.status).toBe('ACTIVE');
      expect(aggregate.createdAt.toISOString()).toBe(CREATED_ISO);
      expect(aggregate.updatedAt.toISOString()).toBe(UPDATED_ISO);
    });
  });

  describe('toEntity', () => {
    it('maps aggregate fields to a TypeORM entity', () => {
      const created = new Date('2022-05-05T10:00:00.000Z');
      const updated = new Date('2022-05-06T10:00:00.000Z');

      const entity = mapper.toEntity({
        id: 'user-2',
        status: 'INACTIVE',
        createdAt: created,
        updatedAt: updated,
      });

      expect(entity).toBeInstanceOf(StubTypeormEntity);
      expect(entity.id).toBe('user-2');
      expect(entity.status).toBe('INACTIVE');
      expect(entity.createdAt).toBe(created);
      expect(entity.updatedAt).toBe(updated);
    });
  });

  describe('toPersistence', () => {
    it('delegates to toEntity', () => {
      const created = new Date('2023-01-01T00:00:00.000Z');
      const updated = new Date('2023-01-02T00:00:00.000Z');
      const aggregate = {
        id: 'user-3',
        status: 'ACTIVE',
        createdAt: created,
        updatedAt: updated,
      };

      expect(mapper.toPersistence(aggregate)).toEqual(mapper.toEntity(aggregate));
    });
  });

  describe('round-trip', () => {
    it('entity → aggregate → entity preserves identity and dates', () => {
      const entity = new StubTypeormEntity();
      entity.id = 'rt-1';
      entity.status = 'ACTIVE';
      entity.createdAt = new Date(CREATED_ISO);
      entity.updatedAt = new Date(UPDATED_ISO);

      const aggregate = mapper.toAggregate(entity);
      const back = mapper.toEntity(aggregate);

      expect(back.id).toBe('rt-1');
      expect(back.status).toBe('ACTIVE');
      expect(back.createdAt).toEqual(entity.createdAt);
      expect(back.updatedAt).toEqual(entity.updatedAt);
    });
  });
});
