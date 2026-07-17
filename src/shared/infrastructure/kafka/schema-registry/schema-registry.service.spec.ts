import { SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

import { IAvroSchema, SchemaRegistryService } from './schema-registry.service';
import { ISchemaRegistryOptions } from './schema-registry-options.interface';

jest.mock('@kafkajs/confluent-schema-registry');

describe('SchemaRegistryService', () => {
  let service: SchemaRegistryService;
  let registry: jest.Mocked<SchemaRegistry>;
  let httpService: jest.Mocked<HttpService>;
  const options: ISchemaRegistryOptions = { host: 'http://registry:8081' };

  const schema: IAvroSchema = {
    type: 'record',
    name: 'Widget',
    fields: [{ name: 'id', type: 'string' }],
  };

  beforeEach(() => {
    registry = {
      register: jest.fn(),
      encode: jest.fn(),
      decode: jest.fn(),
      getLatestSchemaId: jest.fn(),
    } as unknown as jest.Mocked<SchemaRegistry>;

    (SchemaRegistry as jest.Mock).mockImplementation(() => registry);

    httpService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    service = new SchemaRegistryService(options, httpService);
  });

  it('constructs a SchemaRegistry client with the configured host', () => {
    expect(SchemaRegistry).toHaveBeenCalledWith({ host: options.host });
  });

  describe('onModuleInit', () => {
    it('logs without throwing', async () => {
      await expect(service.onModuleInit()).resolves.toBeUndefined();
    });
  });

  describe('registerSchema', () => {
    it('registers the schema as Avro and returns the schema id', async () => {
      registry.register.mockResolvedValue({ id: 42 } as never);

      const result = await service.registerSchema('widget-value', schema);

      expect(registry.register).toHaveBeenCalledWith(
        { type: SchemaType.AVRO, schema: JSON.stringify(schema) },
        { subject: 'widget-value' },
      );
      expect(result).toEqual({ id: 42 });
    });

    it('logs and rethrows when registration fails', async () => {
      const error = new Error('registry unreachable');
      registry.register.mockRejectedValue(error);

      await expect(
        service.registerSchema('widget-value', schema),
      ).rejects.toThrow(error);
    });
  });

  describe('encodeById', () => {
    it('delegates to registry.encode', async () => {
      const buffer = Buffer.from('encoded');
      registry.encode.mockResolvedValue(buffer);

      const result = await service.encodeById(42, { id: 'a' });

      expect(registry.encode).toHaveBeenCalledWith(42, { id: 'a' });
      expect(result).toBe(buffer);
    });

    it('logs and rethrows on encode failure', async () => {
      const error = new Error('encode failed');
      registry.encode.mockRejectedValue(error);

      await expect(service.encodeById(42, { id: 'a' })).rejects.toThrow(error);
    });
  });

  describe('encodeBySubject', () => {
    it('resolves the latest schema id then encodes', async () => {
      registry.getLatestSchemaId.mockResolvedValue(7);
      const buffer = Buffer.from('encoded');
      registry.encode.mockResolvedValue(buffer);

      const result = await service.encodeBySubject('widget-value', {
        id: 'a',
      });

      expect(registry.getLatestSchemaId).toHaveBeenCalledWith('widget-value');
      expect(registry.encode).toHaveBeenCalledWith(7, { id: 'a' });
      expect(result).toBe(buffer);
    });

    it('logs and rethrows when resolving the schema id fails', async () => {
      const error = new Error('subject not found');
      registry.getLatestSchemaId.mockRejectedValue(error);

      await expect(
        service.encodeBySubject('widget-value', { id: 'a' }),
      ).rejects.toThrow(error);
      expect(registry.encode).not.toHaveBeenCalled();
    });
  });

  describe('decode', () => {
    it('delegates to registry.decode', async () => {
      const buffer = Buffer.from('encoded');
      registry.decode.mockResolvedValue({ id: 'a' });

      const result = await service.decode(buffer);

      expect(registry.decode).toHaveBeenCalledWith(buffer);
      expect(result).toEqual({ id: 'a' });
    });

    it('logs and rethrows on decode failure', async () => {
      const error = new Error('decode failed');
      registry.decode.mockRejectedValue(error);

      await expect(service.decode(Buffer.from('bad'))).rejects.toThrow(error);
    });
  });

  describe('getLatestSchemaId', () => {
    it('delegates to registry.getLatestSchemaId', async () => {
      registry.getLatestSchemaId.mockResolvedValue(9);

      const result = await service.getLatestSchemaId('widget-value');

      expect(result).toBe(9);
    });
  });

  describe('getAllSubjects', () => {
    it('GETs /subjects and returns the response data', async () => {
      const response = {
        data: ['widget-value', 'gadget-value'],
      };
      (httpService.get as jest.Mock).mockReturnValue(of(response));

      const result = await service.getAllSubjects();

      expect(httpService.get).toHaveBeenCalledWith(`${options.host}/subjects`);
      expect(result).toEqual(['widget-value', 'gadget-value']);
    });

    it('propagates errors from the HTTP call', async () => {
      (httpService.get as jest.Mock).mockReturnValue(
        throwError(() => new Error('network error')),
      );

      await expect(service.getAllSubjects()).rejects.toThrow('network error');
    });
  });

  describe('getVersions', () => {
    it('GETs /subjects/:subject/versions with an encoded subject and returns the data', async () => {
      const response = { data: [1, 2, 3] };
      (httpService.get as jest.Mock).mockReturnValue(of(response));

      const result = await service.getVersions('widget value');

      expect(httpService.get).toHaveBeenCalledWith(
        `${options.host}/subjects/widget%20value/versions`,
      );
      expect(result).toEqual([1, 2, 3]);
    });
  });
});
