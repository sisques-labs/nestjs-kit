import { BaseMongoDto } from '@/shared/infrastructure/database/mongodb/dtos/base-mongo.dto';
import { BaseMongoDBMapper } from '@/shared/infrastructure/database/mongodb/mappers/base-mongodb.mapper';

type StubViewModel = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

type StubMongoDto = BaseMongoDto & { label: string };

type StubAggregate = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

const CREATED_ISO = '2019-06-15T08:30:00.000Z';
const UPDATED_ISO = '2020-01-02T12:00:00.000Z';

class StubMongoMapper extends BaseMongoDBMapper<
  StubViewModel,
  StubMongoDto,
  StubAggregate
> {
  toAggregate(doc: StubMongoDto): StubAggregate {
    return {
      id: doc.id,
      createdAt: this.normalizeMongoDate(doc.createdAt),
      updatedAt: this.normalizeMongoDate(doc.updatedAt),
    };
  }

  toViewModel(doc: StubMongoDto): StubViewModel {
    return {
      id: doc.id,
      createdAt: this.normalizeMongoDate(doc.createdAt),
      updatedAt: this.normalizeMongoDate(doc.updatedAt),
    };
  }

  fromViewModelToMongoData(viewModel: StubViewModel): StubMongoDto {
    return {
      id: viewModel.id,
      label: 'from-view',
      createdAt: viewModel.createdAt,
      updatedAt: viewModel.updatedAt,
    };
  }

  fromAggregateToMongoData(aggregate: StubAggregate): StubMongoDto {
    return {
      id: aggregate.id,
      label: 'from-aggregate',
      createdAt: aggregate.createdAt,
      updatedAt: aggregate.updatedAt,
    };
  }
}

/** Driver-shaped document where audit fields may be strings */
function driverDoc(overrides: Partial<StubMongoDto> = {}): StubMongoDto {
  return {
    id: 'entity-1',
    label: 'persisted-label',
    createdAt: CREATED_ISO as unknown as Date,
    updatedAt: UPDATED_ISO as unknown as Date,
    ...overrides,
  } as unknown as StubMongoDto;
}

describe('BaseMongoDBMapper', () => {
  let mapper: StubMongoMapper;

  beforeEach(() => {
    mapper = new StubMongoMapper();
  });

  describe('toViewModel', () => {
    it('normalizes string dates from the driver to Date instances', () => {
      const vm = mapper.toViewModel(driverDoc());

      expect(vm.id).toBe('entity-1');
      expect(vm.createdAt).toBeInstanceOf(Date);
      expect(vm.updatedAt).toBeInstanceOf(Date);
      expect(vm.createdAt.toISOString()).toBe(CREATED_ISO);
      expect(vm.updatedAt.toISOString()).toBe(UPDATED_ISO);
    });

    it('accepts Date instances without changing the instant', () => {
      const created = new Date('2021-03-10T00:00:00.000Z');
      const updated = new Date('2021-03-11T00:00:00.000Z');
      const doc: StubMongoDto = {
        id: '2',
        label: 'x',
        createdAt: created,
        updatedAt: updated,
      };

      const vm = mapper.toViewModel(doc);

      expect(vm.createdAt).toBe(created);
      expect(vm.updatedAt).toBe(updated);
    });
  });

  describe('toAggregate', () => {
    it('normalizes dates the same way as toViewModel', () => {
      const agg = mapper.toAggregate(driverDoc({ id: 'agg-1' }));

      expect(agg.id).toBe('agg-1');
      expect(agg.createdAt.toISOString()).toBe(CREATED_ISO);
      expect(agg.updatedAt.toISOString()).toBe(UPDATED_ISO);
    });
  });

  describe('fromViewModelToMongoData', () => {
    it('maps view model fields onto the Mongo DTO shape', () => {
      const created = new Date('2022-05-05T10:00:00.000Z');
      const updated = new Date('2022-05-06T10:00:00.000Z');
      const dto = mapper.fromViewModelToMongoData({
        id: 'vm-1',
        createdAt: created,
        updatedAt: updated,
      });

      expect(dto.id).toBe('vm-1');
      expect(dto.label).toBe('from-view');
      expect(dto.createdAt).toBe(created);
      expect(dto.updatedAt).toBe(updated);
    });
  });

  describe('fromAggregateToMongoData', () => {
    it('maps aggregate fields onto the Mongo DTO shape', () => {
      const created = new Date('2023-07-01T00:00:00.000Z');
      const updated = new Date('2023-07-02T00:00:00.000Z');
      const dto = mapper.fromAggregateToMongoData({
        id: 'agg-2',
        createdAt: created,
        updatedAt: updated,
      });

      expect(dto.id).toBe('agg-2');
      expect(dto.label).toBe('from-aggregate');
      expect(dto.createdAt).toBe(created);
      expect(dto.updatedAt).toBe(updated);
    });
  });

  describe('toPersistence', () => {
    it('delegates to fromAggregateToMongoData', () => {
      const created = new Date('2024-01-01T00:00:00.000Z');
      const updated = new Date('2024-01-02T00:00:00.000Z');
      const aggregate = {
        id: 'agg-3',
        createdAt: created,
        updatedAt: updated,
      };

      expect(mapper.toPersistence(aggregate)).toEqual(
        mapper.fromAggregateToMongoData(aggregate),
      );
    });
  });

  describe('round-trip', () => {
    it('document → view model → Mongo DTO preserves identity and dates', () => {
      const doc = driverDoc({ id: 'rt-1' });
      const vm = mapper.toViewModel(doc);
      const back = mapper.fromViewModelToMongoData(vm);

      expect(back.id).toBe('rt-1');
      expect(back.createdAt.toISOString()).toBe(CREATED_ISO);
      expect(back.updatedAt.toISOString()).toBe(UPDATED_ISO);
      expect(back.label).toBe('from-view');
    });

    it('document → aggregate → Mongo DTO preserves identity and dates', () => {
      const doc = driverDoc({ id: 'rt-2' });
      const agg = mapper.toAggregate(doc);
      const back = mapper.fromAggregateToMongoData(agg);

      expect(back.id).toBe('rt-2');
      expect(back.createdAt.toISOString()).toBe(CREATED_ISO);
      expect(back.updatedAt.toISOString()).toBe(UPDATED_ISO);
      expect(back.label).toBe('from-aggregate');
    });
  });
});
