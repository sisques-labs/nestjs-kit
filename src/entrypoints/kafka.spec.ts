import * as KafkaEntrypoint from './kafka';

describe('entrypoints/kafka barrel', () => {
  it('re-exports the schema registry module and service', () => {
    expect(KafkaEntrypoint.SchemaRegistryModule).toBeDefined();
    expect(KafkaEntrypoint.SchemaRegistryService).toBeDefined();
  });
});
