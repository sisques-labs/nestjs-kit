import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ZodRawShape } from 'zod';

import { IBaseMcpToolContext } from './base-mcp-tool-context.interface';

/**
 * Contract every MCP tool implements.
 *
 * A tool is the MCP equivalent of a GraphQL resolver / REST controller
 * method: a transport-layer entry point that translates tool arguments into
 * a Command/Query and dispatches it through the bus. Tag implementations
 * with `@McpTool()` so `McpToolRegistry` auto-discovers them at bootstrap.
 *
 * `TContext` is the app's own request context shape (see
 * `IMcpContextBuilder`) — a service with no auth can use the default
 * `IBaseMcpToolContext` (`{ requestId }`); a service with auth/tenancy extends it.
 */
export interface IMcpTool<
  TContext extends IBaseMcpToolContext = IBaseMcpToolContext,
> {
  /** Unique tool name exposed to clients (snake_case, e.g. `order_find_by_id`). */
  readonly name: string;
  /** Optional human-friendly title shown by MCP clients. */
  readonly title?: string;
  /** Description of what the tool does — surfaced to the AI client. */
  readonly description: string;
  /** Zod raw shape describing the tool's input arguments. */
  readonly inputSchema: ZodRawShape;
  /**
   * Executes the tool. Arguments are already validated against
   * {@link inputSchema} by the MCP SDK before this is called.
   */
  execute(
    args: Record<string, unknown>,
    context: TContext,
  ): Promise<CallToolResult>;
}
