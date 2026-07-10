import type { Request, Response } from 'express';

import { IMcpContextBuilder } from '../domain/interfaces/mcp-context-builder.interface';
import { IBaseMcpToolContext } from '../domain/interfaces/base-mcp-tool-context.interface';
import { McpServerFactory } from '../application/services/mcp-server.factory';
import { McpController } from './mcp.controller';

const mockTransport = {
  handleRequest: jest.fn(),
  close: jest.fn(),
};

jest.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => ({
  StreamableHTTPServerTransport: jest
    .fn()
    .mockImplementation(() => mockTransport),
}));

describe('McpController', () => {
  let controller: McpController;
  let factory: jest.Mocked<McpServerFactory>;
  let contextBuilder: jest.Mocked<IMcpContextBuilder>;
  let server: { connect: jest.Mock; close: jest.Mock };
  const CONTEXT: IBaseMcpToolContext = { requestId: 'req-1' };

  beforeEach(() => {
    jest.clearAllMocks();
    server = { connect: jest.fn(), close: jest.fn() };
    factory = {
      create: jest.fn().mockReturnValue(server),
    } as unknown as jest.Mocked<McpServerFactory>;
    contextBuilder = {
      build: jest.fn().mockResolvedValue(CONTEXT),
    } as unknown as jest.Mocked<IMcpContextBuilder>;
    controller = new McpController(factory, contextBuilder);
  });

  describe('handleRequest()', () => {
    it('builds the context and creates a per-request server bound to it', async () => {
      const req = { body: { jsonrpc: '2.0' } } as unknown as Request;
      const res = { on: jest.fn() } as unknown as Response;

      await controller.handleRequest(req, res);

      expect(contextBuilder.build).toHaveBeenCalledWith(req);
      expect(factory.create).toHaveBeenCalledWith(CONTEXT);
      expect(server.connect).toHaveBeenCalledWith(mockTransport);
      expect(mockTransport.handleRequest).toHaveBeenCalledWith(
        req,
        res,
        req.body,
      );
      expect(res.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    it('closes the transport and server when the response closes', async () => {
      const req = { body: {} } as unknown as Request;
      let closeHandler: () => void = () => undefined;
      const res = {
        on: jest.fn((event: string, cb: () => void) => {
          if (event === 'close') closeHandler = cb;
        }),
      } as unknown as Response;

      await controller.handleRequest(req, res);
      closeHandler();

      expect(mockTransport.close).toHaveBeenCalledTimes(1);
      expect(server.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('unsupported methods', () => {
    it('responds 405 for GET', () => {
      const json = jest.fn();
      const res = {
        status: jest.fn().mockReturnValue({ json }),
      } as unknown as Response;

      controller.handleGet(res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ jsonrpc: '2.0' }),
      );
    });

    it('responds 405 for DELETE', () => {
      const json = jest.fn();
      const res = {
        status: jest.fn().mockReturnValue({ json }),
      } as unknown as Response;

      controller.handleDelete(res);

      expect(res.status).toHaveBeenCalledWith(405);
    });
  });
});
