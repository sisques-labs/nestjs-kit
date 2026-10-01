import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';

import { Criteria } from '@/shared/domain/entities/criteria';
import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';
import { applyCriteriaToQueryBuilder } from '@/shared/infrastructure/database/typeorm/criteria/apply-criteria-to-query-builder';

import { LikeProbe } from './like-probe.entity';

describe('applyCriteriaToQueryBuilder LIKE (PostgreSQL)', () => {
  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;

  const search = async (field: string, value: string): Promise<string[]> => {
    const qb = dataSource.getRepository(LikeProbe).createQueryBuilder('p');
    applyCriteriaToQueryBuilder(
      qb,
      new Criteria([{ field, operator: FilterOperator.LIKE, value }]),
      { alias: 'p' },
    );
    const rows = await qb.orderBy('p.id', 'ASC').getMany();
    return rows.map((row) => row.name);
  };

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    dataSource = new DataSource({
      type: 'postgres',
      url: container.getConnectionUri(),
      entities: [LikeProbe],
      synchronize: true,
    });
    await dataSource.initialize();

    const repo = dataSource.getRepository(LikeProbe);
    await repo.save([
      {
        bornOn: '2024-03-10',
        createdAt: new Date('2024-03-15T10:00:00Z'),
        quantity: 42,
        externalId: 'aaaaaaaa-1111-4111-8111-111111111111',
        name: 'rose',
      },
      {
        bornOn: '2023-07-01',
        createdAt: new Date('2023-07-01T10:00:00Z'),
        quantity: 7,
        externalId: 'bbbbbbbb-2222-4222-8222-222222222222',
        name: '500',
      },
      {
        bornOn: '2022-01-01',
        createdAt: new Date('2022-01-01T10:00:00Z'),
        quantity: 8,
        externalId: 'cccccccc-3333-4333-8333-333333333333',
        name: 'axb',
      },
      {
        bornOn: '2021-01-01',
        createdAt: new Date('2021-01-01T10:00:00Z'),
        quantity: 9,
        externalId: 'dddddddd-4444-4444-8444-444444444444',
        name: '50% off',
      },
      {
        bornOn: '2020-01-01',
        createdAt: new Date('2020-01-01T10:00:00Z'),
        quantity: 10,
        externalId: 'eeeeeeee-5555-4555-8555-555555555555',
        name: 'a_b',
      },
      {
        bornOn: '2019-01-01',
        createdAt: new Date('2019-01-01T10:00:00Z'),
        quantity: 11,
        externalId: 'ffffffff-6666-4666-8666-666666666666',
        name: 'a\\b',
      },
    ]);
  });

  afterAll(async () => {
    await dataSource?.destroy();
    await container?.stop();
  });

  it('matches a date column by text prefix', async () => {
    expect(await search('bornOn', '2024-03')).toEqual(['rose']);
  });

  it('matches a timestamptz column by text prefix', async () => {
    expect(await search('createdAt', '2024-03-15')).toEqual(['rose']);
  });

  it('matches an integer column', async () => {
    expect(await search('quantity', '42')).toEqual(['rose']);
  });

  it('matches a uuid column by prefix', async () => {
    expect(await search('externalId', 'aaaaaaaa')).toEqual(['rose']);
  });

  it('keeps matching text columns case-insensitively', async () => {
    expect(await search('name', 'ROS')).toEqual(['rose']);
  });

  it('treats % literally so "50%" does not match "500"', async () => {
    expect(await search('name', '50%')).toEqual(['50% off']);
  });

  it('treats _ literally so "a_b" does not match "axb"', async () => {
    expect(await search('name', 'a_b')).toEqual(['a_b']);
  });

  it('treats \\ literally so "a\\b" matches only the backslash row', async () => {
    expect(await search('name', 'a\\b')).toEqual(['a\\b']);
  });

  it('rewrites the property path into the database column inside CAST', () => {
    const qb = dataSource.getRepository(LikeProbe).createQueryBuilder('p');
    applyCriteriaToQueryBuilder(
      qb,
      new Criteria([
        { field: 'bornOn', operator: FilterOperator.LIKE, value: '2024' },
      ]),
      { alias: 'p' },
    );

    expect(qb.getQuery()).toContain('CAST("p"."born_on" AS text)');
  });
});
