// ─── MCP (Model Context Protocol) ──────────────────────────────────────────────
// Separate entry point so importing '@sisques-labs/nestjs-kit' does not
// require the optional `@modelcontextprotocol/sdk`, `zod`, and `express` peer
// dependencies. Import from '@sisques-labs/nestjs-kit/mcp' when you expose
// your app's commands/queries as MCP tools.

export * from '../shared/mcp/domain/constants/mcp-tool.constants';
export * from '../shared/mcp/domain/decorators/mcp-tool.decorator';
export * from '../shared/mcp/domain/interfaces/mcp-context-builder.interface';
export * from '../shared/mcp/domain/interfaces/base-mcp-tool-context.interface';
export * from '../shared/mcp/domain/interfaces/mcp-tool.interface';

export * from '../shared/mcp/application/services/default-mcp-context-builder.service';
export * from '../shared/mcp/application/services/mcp-server.factory';
export * from '../shared/mcp/application/services/mcp-tool-registry.service';

export * from '../shared/mcp/transport/mcp.controller';

export * from '../shared/mcp/mcp-module-options.interface';
export * from '../shared/mcp/mcp.module';
