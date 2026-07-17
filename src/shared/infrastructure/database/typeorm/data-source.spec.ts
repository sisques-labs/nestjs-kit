import { DataSource } from 'typeorm';

// `new DataSource(...)` eagerly loads the driver package (e.g. `pg`) which is
// a peer dependency this library doesn't install. Mock the constructor so we
// can assert on the options it was built with, without needing a real driver.
jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    DataSource: jest.fn().mockImplementation((options: unknown) => ({
      options,
    })),
  };
});

const REQUIRED_ENV = {
  DATABASE_DRIVER: 'postgres',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '5432',
  DATABASE_USERNAME: 'user',
  DATABASE_PASSWORD: 'pass',
  DATABASE_DATABASE: 'db',
};

describe('data-source', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('builds dataSourceOptions and a DataSource from required env vars', () => {
    jest.isolateModules(() => {
      Object.assign(process.env, REQUIRED_ENV);
      delete process.env.DATABASE_MIGRATIONS_TABLE_NAME;
      delete process.env.DATABASE_SYNCHRONIZE;
      process.env.NODE_ENV = 'test';

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('./data-source');

      expect(mod.dataSourceOptions).toMatchObject({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'user',
        password: 'pass',
        database: 'db',
        migrationsTableName: 'migrations',
        migrationsRun: false,
        synchronize: false,
        logging: true,
        extra: { connectionLimit: 10 },
      });
      expect(DataSource).toHaveBeenCalledWith(mod.dataSourceOptions);
      expect(mod.dataSource).toEqual({ options: mod.dataSourceOptions });
    });
  });

  it('respects DATABASE_MIGRATIONS_TABLE_NAME and DATABASE_SYNCHRONIZE overrides', () => {
    jest.isolateModules(() => {
      Object.assign(process.env, REQUIRED_ENV);
      process.env.DATABASE_MIGRATIONS_TABLE_NAME = 'custom_migrations';
      process.env.DATABASE_SYNCHRONIZE = 'true';
      process.env.NODE_ENV = 'production';

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('./data-source');

      expect(mod.dataSourceOptions.migrationsTableName).toBe(
        'custom_migrations',
      );
      expect(mod.dataSourceOptions.synchronize).toBe(true);
      expect(mod.dataSourceOptions.logging).toBe(false);
    });
  });

  it('throws when a required env var is missing', () => {
    jest.isolateModules(() => {
      Object.assign(process.env, REQUIRED_ENV);
      delete process.env.DATABASE_HOST;

      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./data-source'),
      ).toThrow(
        'Missing environment variable "DATABASE_HOST" for TypeORM CLI data source',
      );
    });
  });

  it('throws when a required env var is an empty string', () => {
    jest.isolateModules(() => {
      Object.assign(process.env, REQUIRED_ENV);
      process.env.DATABASE_PASSWORD = '';

      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./data-source'),
      ).toThrow(
        'Missing environment variable "DATABASE_PASSWORD" for TypeORM CLI data source',
      );
    });
  });
});
