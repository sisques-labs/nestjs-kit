import { Inject, Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { MCP_MODULE_OPTIONS } from '../../domain/constants/mcp-tool.constants';
import { IMcpToolContext } from '../../domain/interfaces/mcp-tool-context.interface';
import { IMcpModuleOptions } from '../../mcp-module-options.interface';
import { McpToolRegistry } from './mcp-tool-registry.service';

/**
 * Builds a fresh {@link McpServer} for each incoming MCP request.
 *
 * The server is created per request (stateless Streamable HTTP) so each tool
 * handler closes over the request's {@link IMcpToolContext}, built by the
 * app's `IMcpContextBuilder`. This keeps isolation strict when a service adds
 * auth/tenancy: a request can only act as whatever identity its own context
 * builder resolved.
 */
@Injectable()
export class McpServerFactory {
  constructor(
    private readonly toolRegistry: McpToolRegistry,
    @Inject(MCP_MODULE_OPTIONS)
    private readonly options: IMcpModuleOptions,
  ) {}

  create<TContext extends IMcpToolContext = IMcpToolContext>(
    context: TContext,
  ): McpServer {
    const server = new McpServer({
      name: this.options.name,
      version: this.options.version,
    });

    for (const tool of this.toolRegistry.getTools()) {
      server.registerTool(
        tool.name,
        {
          title: tool.title,
          description: tool.description,
          inputSchema: tool.inputSchema,
        },
        (args: Record<string, unknown>) => tool.execute(args, context),
      );
    }

    return server;
  }
}
