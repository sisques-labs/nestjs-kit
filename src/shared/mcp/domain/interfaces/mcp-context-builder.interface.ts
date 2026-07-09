import { Request } from 'express';

import { IMcpToolContext } from './mcp-tool-context.interface';

/**
 * Builds the per-request {@link IMcpToolContext} handed to every MCP tool.
 *
 * This is the one seam that legitimately differs per app: a service with no
 * auth returns a bare correlation id (see `DefaultMcpContextBuilder`); a
 * service with auth/tenancy reads the authenticated user/tenant off `req`
 * (already populated by that app's own guards, which run before this
 * controller) or injects its own request-scoped services via the
 * constructor. Override via `McpModule.forRoot({ contextBuilder: MyBuilder })`.
 */
export interface IMcpContextBuilder<
  TContext extends IMcpToolContext = IMcpToolContext,
> {
  build(req: Request): TContext | Promise<TContext>;
}
