import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { MongoService } from './services/mongo.service';
import { MongoModule } from './mongodb.module';

jest.mock('mongodb');

const mockConfigService = {
  get: jest.fn(),
} as unknown as ConfigService;

// Stand-in for the app's own `ConfigModule.forRoot({ isGlobal: true })`, so
// `MongoService` can resolve its `ConfigService` dependency without booting a
// real config module.
@Global()
@Module({
  providers: [{ provide: ConfigService, useValue: mockConfigService }],
  exports: [ConfigService],
})
class TestConfigModule {}

describe('MongoModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TestConfigModule, MongoModule],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      // MongoService.onModuleDestroy() dereferences `this.client`, which is
      // only set once `onModuleInit` connects. We never bootstrap a full app
      // here, so stub a no-op client to let `module.close()` tear down cleanly.
      const service = module.get(MongoService);
      if (service && !service['client']) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-only stub, real type is MongoClient
        service['client'] = {
          close: jest.fn().mockResolvedValue(undefined),
        } as any;
      }
      await module.close();
    }
  });

  it('is decorated as a global module', () => {
    const isGlobal = Reflect.getMetadata('__module:global__', MongoModule);
    expect(isGlobal).toBe(true);
  });

  it('provides and exports MongoService', () => {
    const service = module.get(MongoService);
    expect(service).toBeInstanceOf(MongoService);
  });
});
