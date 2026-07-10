import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { IMcpModuleOptions } from '../../mcp-module-options.interface';
import { IMcpTool } from '../../domain/interfaces/mcp-tool.interface';
import { IBaseMcpToolContext } from '../../domain/interfaces/base-mcp-tool-context.interface';
import { McpServerFactory } from './mcp-server.factory';
import { McpToolRegistry } from './mcp-tool-registry.service';

const CONTEXT: IBaseMcpToolContext = { requestId: 'req-1' };
const OPTIONS: IMcpModuleOptions = { name: 'test-service', version: '0.1.0' };

describe('McpServerFactory', () => {
  let factory: McpServerFactory;
  let registry: jest.Mocked<McpToolRegistry>;
  let tool: jest.Mocked<IMcpTool>;

  beforeEach(() => {
    tool = {
      name: 'fake_tool',
      title: 'Fake',
      description: 'fake',
      inputSchema: {},
      execute: jest.fn().mockResolvedValue({ content: [] }),
    };
    registry = {
      getTools: jest.fn().mockReturnValue([tool]),
    } as unknown as jest.Mocked<McpToolRegistry>;
    factory = new McpServerFactory(registry, OPTIONS);
  });

  it('registers every tool on a fresh server bound to the request context', async () => {
    const registerSpy = jest.spyOn(McpServer.prototype, 'registerTool');

    const server = factory.create(CONTEXT);

    expect(server).toBeInstanceOf(McpServer);
    expect(registerSpy).toHaveBeenCalledWith(
      'fake_tool',
      expect.objectContaining({ description: 'fake', inputSchema: {} }),
      expect.any(Function),
    );

    // The registered callback forwards args + context to the tool.
    const callback = registerSpy.mock.calls[0][2] as (
      args: Record<string, unknown>,
    ) => Promise<unknown>;
    await callback({ foo: 'bar' });
    expect(tool.execute).toHaveBeenCalledWith({ foo: 'bar' }, CONTEXT);

    registerSpy.mockRestore();
  });

  it('creates a fresh server instance per call', () => {
    const first = factory.create(CONTEXT);
    const second = factory.create(CONTEXT);

    expect(first).not.toBe(second);
  });
});
