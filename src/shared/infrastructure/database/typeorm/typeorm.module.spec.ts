import { ConfigService } from '@nestjs/config';

import { TypeormMasterService } from './services/typeorm-master/typeorm-master.service';
import { buildTypeOrmModuleOptions } from './typeorm-module-options.factory';
import { TypeOrmModule } from './typeorm.module';

// `TypeOrmModule` is a plain `@Module({...})` with hardcoded imports (no
// static forRoot of its own) — the interesting behavior is entirely in the
// decorator metadata assembled at class-declaration time. We don't spin up a
// real TypeORM connection here (no driver package installed, and it would
// require an actual database); instead we assert on the metadata shape and
// on the `useFactory` wired into `NestTypeOrmModule.forRootAsync`.
describe('TypeOrmModule', () => {
  it('is decorated as a global module', () => {
    const isGlobal = Reflect.getMetadata('__module:global__', TypeOrmModule);
    expect(isGlobal).toBe(true);
  });

  it('provides and exports TypeormMasterService', () => {
    const providers = Reflect.getMetadata(
      'providers',
      TypeOrmModule,
    ) as Array<unknown>;
    const exports_ = Reflect.getMetadata(
      'exports',
      TypeOrmModule,
    ) as Array<unknown>;

    expect(providers).toContain(TypeormMasterService);
    expect(exports_).toContain(TypeormMasterService);
  });

  interface TypeOrmOptionsProvider {
    provide: string;
    inject?: unknown[];
    useFactory?: (...args: unknown[]) => unknown;
  }

  interface NestTypeOrmDynamicModule {
    providers?: TypeOrmOptionsProvider[];
    imports?: NestTypeOrmDynamicModule[];
  }

  /**
   * `NestTypeOrmModule.forRootAsync` returns a wrapper dynamic module whose
   * own `imports` array nests the actual dynamic module carrying the
   * `TypeOrmModuleOptions` async provider — this digs down to it.
   */
  function findTypeOrmCoreModule(): NestTypeOrmDynamicModule {
    const imports = Reflect.getMetadata(
      'imports',
      TypeOrmModule,
    ) as NestTypeOrmDynamicModule[];

    expect(imports).toHaveLength(1);

    const [wrapper] = imports;
    const nested = wrapper.imports?.[0];
    expect(nested).toBeDefined();
    return nested as NestTypeOrmDynamicModule;
  }

  it('wires exactly one import: NestTypeOrmModule.forRootAsync', () => {
    const typeOrmDynamicModule = findTypeOrmCoreModule();

    expect(typeOrmDynamicModule.providers).toBeDefined();
    expect(
      typeOrmDynamicModule.providers?.some(
        (provider) => provider.provide === 'TypeOrmModuleOptions',
      ),
    ).toBe(true);
  });

  it('the forRootAsync useFactory delegates to buildTypeOrmModuleOptions', () => {
    const typeOrmDynamicModule = findTypeOrmCoreModule();

    const asyncOptionsProvider = typeOrmDynamicModule.providers?.find(
      (provider) => provider.provide === 'TypeOrmModuleOptions',
    );
    expect(asyncOptionsProvider).toBeDefined();
    expect(asyncOptionsProvider?.inject).toContain(ConfigService);

    const configService = {
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string> = {
          DATABASE_DRIVER: 'postgres',
          DATABASE_HOST: 'localhost',
          DATABASE_PORT: '5432',
          DATABASE_USERNAME: 'user',
          DATABASE_PASSWORD: 'pass',
          DATABASE_DATABASE: 'db',
        };
        return values[key];
      }),
      get: jest.fn(),
    } as unknown as ConfigService;

    const result = asyncOptionsProvider?.useFactory?.(configService);
    expect(result).toEqual(buildTypeOrmModuleOptions(configService));
  });
});
