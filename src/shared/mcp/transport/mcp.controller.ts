import {
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Request, Response } from 'express';

import { MCP_CONTEXT_BUILDER } from '../domain/constants/mcp-tool.constants';
import { IMcpContextBuilder } from '../domain/interfaces/mcp-context-builder.interface';
import { McpServerFactory } from '../application/services/mcp-server.factory';

/**
 * MCP transport entry point (Streamable HTTP, stateless).
 *
 * Exposed at `POST /mcp` (mounted under the app's own global prefix, e.g.
 * `/api/mcp`). Add auth guards at the app level (`@UseGuards` here, or a
 * global guard) — the resolved identity flows into tools via the injected
 * `IMcpContextBuilder` (see `McpModule.forRoot({ contextBuilder })`).
 *
 * A new MCP server + transport is created per request (no session state):
 * every request re-runs the context builder, matching the rest of the API.
 */
@Controller('mcp')
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(
    private readonly mcpServerFactory: McpServerFactory,
    @Inject(MCP_CONTEXT_BUILDER)
    private readonly contextBuilder: IMcpContextBuilder,
  ) {}

  @Post()
  async handleRequest(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const context = await this.contextBuilder.build(req);
    // Context shape is app-defined and may carry identity fields once a
    // service adds auth — avoid logging it wholesale here to not leak PII.
    this.logger.log('MCP request received');

    const server = this.mcpServerFactory.create(context);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      // Reply with a single JSON-RPC response instead of an SSE stream — the
      // tools are request/response only, so clients get plain application/json.
      enableJsonResponse: true,
    });

    res.on('close', () => {
      void transport.close();
      void server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }

  @Get()
  handleGet(@Res() res: Response): void {
    this.methodNotAllowed(res);
  }

  @Delete()
  handleDelete(@Res() res: Response): void {
    this.methodNotAllowed(res);
  }

  /**
   * Stateless transport keeps no session, so the SSE stream (GET) and session
   * termination (DELETE) defined by the spec are not supported.
   */
  private methodNotAllowed(res: Response): void {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed.' },
      id: null,
    });
  }
}
