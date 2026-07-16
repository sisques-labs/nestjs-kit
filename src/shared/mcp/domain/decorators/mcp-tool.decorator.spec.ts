import { MCP_TOOL_METADATA } from '@/shared/mcp/domain/constants/mcp-tool.constants';
import { McpTool } from '@/shared/mcp/domain/decorators/mcp-tool.decorator';

@McpTool()
class DecoratedTool {}

class UndecoratedClass {}

describe('McpTool decorator', () => {
  it('sets the MCP_TOOL_METADATA metadata to true on the decorated class', () => {
    expect(Reflect.getMetadata(MCP_TOOL_METADATA, DecoratedTool)).toBe(true);
  });

  it('leaves an undecorated class without the metadata', () => {
    expect(
      Reflect.getMetadata(MCP_TOOL_METADATA, UndecoratedClass),
    ).toBeUndefined();
  });
});
