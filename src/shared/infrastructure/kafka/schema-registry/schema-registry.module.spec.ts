import { HttpModule } from '@nestjs/axios';

import { SCHEMA_REGISTRY_OPTIONS } from './schema-registry.constants';
import { SchemaRegistryModule } from './schema-registry.module';
import { SchemaRegistryService } from './schema-registry.service';

describe('SchemaRegistryModule', () => {
  describe('forRoot', () => {
    it('provides SCHEMA_REGISTRY_OPTIONS as a static value and imports HttpModule', () => {
      const options = { host: 'http://registry:8081' };
      const dynamicModule = SchemaRegistryModule.forRoot(options);

      expect(dynamicModule.module).toBe(SchemaRegistryModule);
      expect(dynamicModule.imports).toContain(HttpModule);
      expect(dynamicModule.providers).toContainEqual({
        provide: SCHEMA_REGISTRY_OPTIONS,
        useValue: options,
      });
      expect(dynamicModule.providers).toContain(SchemaRegistryService);
      expect(dynamicModule.exports).toContain(SchemaRegistryService);
    });
  });

  describe('forRootAsync', () => {
    it('wires a useFactory provider with the given inject tokens and extra imports', () => {
      const useFactory = jest.fn();
      const ExtraModule = class {};

      const dynamicModule = SchemaRegistryModule.forRootAsync({
        imports: [ExtraModule],
        inject: ['SOME_TOKEN'],
        useFactory,
      });

      expect(dynamicModule.module).toBe(SchemaRegistryModule);
      expect(dynamicModule.imports).toEqual([HttpModule, ExtraModule]);
      expect(dynamicModule.providers).toContainEqual({
        provide: SCHEMA_REGISTRY_OPTIONS,
        inject: ['SOME_TOKEN'],
        useFactory,
      });
      expect(dynamicModule.providers).toContain(SchemaRegistryService);
      expect(dynamicModule.exports).toContain(SchemaRegistryService);
    });

    it('defaults inject/imports to empty arrays when omitted', () => {
      const useFactory = jest.fn();

      const dynamicModule = SchemaRegistryModule.forRootAsync({ useFactory });

      expect(dynamicModule.imports).toEqual([HttpModule]);
      expect(dynamicModule.providers).toContainEqual({
        provide: SCHEMA_REGISTRY_OPTIONS,
        inject: [],
        useFactory,
      });
    });
  });
});
