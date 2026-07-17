import { ConfigService } from '@nestjs/config';

import { buildTypeOrmModuleOptions } from './typeorm-module-options.factory';

function makeConfigService(
  values: Record<string, string | undefined>,
): jest.Mocked<ConfigService> {
  return {
    getOrThrow: jest.fn((key: string) => {
      const value = values[key];
      if (value === undefined) {
        throw new Error(`Missing config key "${key}"`);
      }
      return value;
    }),
    get: jest.fn((key: string) => values[key]),
  } as unknown as jest.Mocked<ConfigService>;
}

describe('buildTypeOrmModuleOptions', () => {
  it('builds TypeOrmModuleOptions from ConfigService values', () => {
    const configService = makeConfigService({
      DATABASE_DRIVER: 'postgres',
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: '5432',
      DATABASE_USERNAME: 'user',
      DATABASE_PASSWORD: 'pass',
      DATABASE_DATABASE: 'db',
    });

    const options = buildTypeOrmModuleOptions(configService);

    expect(options).toMatchObject({
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
    expect((options as { entities: string[] }).entities[0]).toContain(
      '*-typeorm.entity',
    );
    expect((options as { migrations: string[] }).migrations[0]).toContain(
      'migrations',
    );
  });

  it('defaults migrationsTableName to "migrations" when not provided', () => {
    const configService = makeConfigService({
      DATABASE_DRIVER: 'mysql',
      DATABASE_HOST: 'host',
      DATABASE_PORT: '3306',
      DATABASE_USERNAME: 'u',
      DATABASE_PASSWORD: 'p',
      DATABASE_DATABASE: 'd',
    });

    const options = buildTypeOrmModuleOptions(configService);

    expect(
      (options as { migrationsTableName: string }).migrationsTableName,
    ).toBe('migrations');
  });

  it('uses a custom migrationsTableName when provided', () => {
    const configService = makeConfigService({
      DATABASE_DRIVER: 'mysql',
      DATABASE_HOST: 'host',
      DATABASE_PORT: '3306',
      DATABASE_USERNAME: 'u',
      DATABASE_PASSWORD: 'p',
      DATABASE_DATABASE: 'd',
      DATABASE_MIGRATIONS_TABLE_NAME: 'custom_migrations',
    });

    const options = buildTypeOrmModuleOptions(configService);

    expect(
      (options as { migrationsTableName: string }).migrationsTableName,
    ).toBe('custom_migrations');
  });

  it('derives synchronize=true only when DATABASE_SYNCHRONIZE === "true"', () => {
    const configService = makeConfigService({
      DATABASE_DRIVER: 'mysql',
      DATABASE_HOST: 'host',
      DATABASE_PORT: '3306',
      DATABASE_USERNAME: 'u',
      DATABASE_PASSWORD: 'p',
      DATABASE_DATABASE: 'd',
      DATABASE_SYNCHRONIZE: 'true',
    });

    const options = buildTypeOrmModuleOptions(configService);

    expect((options as { synchronize: boolean }).synchronize).toBe(true);
  });

  it('derives logging=false when NODE_ENV === "production"', () => {
    const configService = makeConfigService({
      DATABASE_DRIVER: 'mysql',
      DATABASE_HOST: 'host',
      DATABASE_PORT: '3306',
      DATABASE_USERNAME: 'u',
      DATABASE_PASSWORD: 'p',
      DATABASE_DATABASE: 'd',
      NODE_ENV: 'production',
    });

    const options = buildTypeOrmModuleOptions(configService);

    expect((options as { logging: boolean }).logging).toBe(false);
  });
});
