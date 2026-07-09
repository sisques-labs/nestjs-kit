/**
 * Metadata key used to flag a provider as an MCP tool.
 *
 * Providers tagged with the {@link McpTool} decorator are discovered at
 * bootstrap by `McpToolRegistry` via NestJS `DiscoveryService` and
 * registered on the per-request MCP server.
 */
export const MCP_TOOL_METADATA = Symbol('mcp:tool');

/** DI token for the resolved {@link IMcpModuleOptions} (server name/version). */
export const MCP_MODULE_OPTIONS = Symbol('MCP_MODULE_OPTIONS');

/** DI token for the app's {@link IMcpContextBuilder} implementation. */
export const MCP_CONTEXT_BUILDER = Symbol('MCP_CONTEXT_BUILDER');
