import { ConfigService } from '@nestjs/config';
import { EachMessagePayload, Kafka } from 'kafkajs';

import { IInboundMessage } from '../../domain/interfaces/inbound-message.interface';
import { IKafkaConfig } from './kafka-config.interface';
import { KafkajsEventConsumerAdapter } from './kafkajs-event-consumer.adapter';

jest.mock('kafkajs');

const KAFKA_CONFIG: IKafkaConfig = {
  enabled: true,
  clientId: 'my-service',
  brokers: ['localhost:9092'],
  topicPrefix: 'my-service',
  ssl: false,
  sasl: null,
};

function makeEachMessagePayload(
  overrides: Partial<EachMessagePayload['message']> = {},
): EachMessagePayload {
  return {
    topic: 'my-service.telemetry',
    partition: 0,
    message: {
      key: Buffer.from('node-1'),
      value: Buffer.from(JSON.stringify({ reading: 42 })),
      headers: { 'message-type': Buffer.from('telemetry') },
      offset: '0',
      timestamp: '0',
      attributes: 0,
      ...overrides,
    },
    heartbeat: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
  } as unknown as EachMessagePayload;
}

describe('KafkajsEventConsumerAdapter', () => {
  let capturedRunConfig: {
    eachMessage: (payload: EachMessagePayload) => Promise<void>;
  };
  const consumer = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn().mockResolvedValue(undefined),
    run: jest.fn().mockImplementation((config) => {
      capturedRunConfig = config;
      return Promise.resolve();
    }),
  };
  let adapter: KafkajsEventConsumerAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    (Kafka as unknown as jest.Mock).mockImplementation(() => ({
      consumer: () => consumer,
    }));

    const configService = {
      getOrThrow: jest.fn().mockReturnValue(KAFKA_CONFIG),
    } as unknown as ConfigService;

    adapter = new KafkajsEventConsumerAdapter(configService);
  });

  it('connects and subscribes to the given topics under groupId', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);

    await adapter.run('nodes-consumer', ['my-service.telemetry'], handler);

    expect(consumer.connect).toHaveBeenCalledTimes(1);
    expect(consumer.subscribe).toHaveBeenCalledWith({
      topics: ['my-service.telemetry'],
      fromBeginning: false,
    });
  });

  it('decodes key/headers/value and dispatches to the handler', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    await adapter.run('nodes-consumer', ['my-service.telemetry'], handler);

    await capturedRunConfig.eachMessage(makeEachMessagePayload());

    const received: IInboundMessage = handler.mock.calls[0][0];
    expect(received).toEqual({
      topic: 'my-service.telemetry',
      partition: 0,
      key: 'node-1',
      headers: { 'message-type': 'telemetry' },
      value: JSON.stringify({ reading: 42 }),
    });
  });

  it('logs and swallows a handler failure instead of propagating', async () => {
    const handler = jest.fn().mockRejectedValue(new Error('bad payload'));
    await adapter.run('nodes-consumer', ['my-service.telemetry'], handler);

    await expect(
      capturedRunConfig.eachMessage(makeEachMessagePayload()),
    ).resolves.toBeUndefined();
  });

  it('disconnects every consumer created via run() on module destroy', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    await adapter.run('nodes-consumer', ['my-service.telemetry'], handler);
    await adapter.run(
      'nodes-acks-consumer',
      ['my-service.command-acks'],
      handler,
    );

    await adapter.onModuleDestroy();

    expect(consumer.disconnect).toHaveBeenCalledTimes(2);
  });

  describe('when Kafka is disabled', () => {
    let disabledAdapter: KafkajsEventConsumerAdapter;

    beforeEach(() => {
      (Kafka as unknown as jest.Mock).mockClear();
      const configService = {
        getOrThrow: jest
          .fn()
          .mockReturnValue({ ...KAFKA_CONFIG, enabled: false }),
      } as unknown as ConfigService;
      disabledAdapter = new KafkajsEventConsumerAdapter(configService);
    });

    it('never creates a Kafka client', () => {
      expect(Kafka).not.toHaveBeenCalled();
    });

    it('is a no-op on run and destroy', async () => {
      const handler = jest.fn();

      await disabledAdapter.run('nodes-consumer', ['topic'], handler);
      await disabledAdapter.onModuleDestroy();

      expect(consumer.connect).not.toHaveBeenCalled();
      expect(consumer.subscribe).not.toHaveBeenCalled();
      expect(consumer.disconnect).not.toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
