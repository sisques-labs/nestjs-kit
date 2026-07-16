import { DiscoveryModule } from '@nestjs/core';

import { DefaultMcpContextBuilder } from './application/services/default-mcp-context-builder.service';
import { McpServerFactory } from './application/services/mcp-server.factory';
import { McpToolRegistry } from './application/services/mcp-tool-registry.service';
import {
  MCP_CONTEXT_BUILDER,
  MCP_MODULE_OPTIONS,
} from './domain/constants/mcp-tool.constants';
import { IMcpContextBuilder } from './domain/interfaces/mcp-context-builder.interface';
import { McpModule } from './mcp.module';
import { McpController } from './transport/mcp.controller';

describe('McpModule.forRoot', () => {
  it('wires DiscoveryModule, the MCP controller, and the shared providers', () => {
    const options = { name: 'my-service', version: '1.0.0' };

    const dynamicModule = McpModule.forRoot(options);

    expect(dynamicModule.module).toBe(McpModule);
    expect(dynamicModule.imports).toEqual([DiscoveryModule]);
    expect(dynamicModule.controllers).toEqual([McpController]);
    expect(dynamicModule.exports).toEqual([McpToolRegistry, McpServerFactory]);
  });

  it('provides MCP_MODULE_OPTIONS as a static value', () => {
    const options = { name: 'my-service', version: '1.0.0' };

    const dynamicModule = McpModule.forRoot(options);

    expect(dynamicModule.providers).toContainEqual({
      provide: MCP_MODULE_OPTIONS,
      useValue: options,
    });
  });

  it('defaults MCP_CONTEXT_BUILDER to DefaultMcpContextBuilder when no contextBuilder is given', () => {
    const dynamicModule = McpModule.forRoot({
      name: 'my-service',
      version: '1.0.0',
    });

    expect(dynamicModule.providers).toContainEqual({
      provide: MCP_CONTEXT_BUILDER,
      useClass: DefaultMcpContextBuilder,
    });
  });

  it('uses a custom contextBuilder when provided', () => {
    class CustomContextBuilder implements IMcpContextBuilder {
      build() {
        return { requestId: 'test' };
      }
    }

    const dynamicModule = McpModule.forRoot({
      name: 'my-service',
      version: '1.0.0',
      contextBuilder: CustomContextBuilder,
    });

    expect(dynamicModule.providers).toContainEqual({
      provide: MCP_CONTEXT_BUILDER,
      useClass: CustomContextBuilder,
    });
  });

  it('always provides McpToolRegistry and McpServerFactory', () => {
    const dynamicModule = McpModule.forRoot({
      name: 'my-service',
      version: '1.0.0',
    });

    expect(dynamicModule.providers).toContain(McpToolRegistry);
    expect(dynamicModule.providers).toContain(McpServerFactory);
  });
});
