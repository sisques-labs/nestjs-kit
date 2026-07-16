import * as McpEntrypoint from './mcp';

describe('entrypoints/mcp barrel', () => {
  it('re-exports MCP constants, decorator, services, controller and module', () => {
    expect(McpEntrypoint.MCP_TOOL_METADATA).toBeDefined();
    expect(McpEntrypoint.McpTool).toBeDefined();
    expect(McpEntrypoint.DefaultMcpContextBuilder).toBeDefined();
    expect(McpEntrypoint.McpServerFactory).toBeDefined();
    expect(McpEntrypoint.McpToolRegistry).toBeDefined();
    expect(McpEntrypoint.McpController).toBeDefined();
    expect(McpEntrypoint.McpModule).toBeDefined();
  });
});
