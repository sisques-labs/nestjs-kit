import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { McpServerFactory } from './application/services/mcp-server.factory';
import { McpToolRegistry } from './application/services/mcp-tool-registry.service';
import { DefaultMcpContextBuilder } from './application/services/default-mcp-context-builder.service';
import {
  MCP_CONTEXT_BUILDER,
  MCP_MODULE_OPTIONS,
} from './domain/constants/mcp-tool.constants';
import { IMcpModuleOptions } from './mcp-module-options.interface';
import { McpController } from './transport/mcp.controller';

/**
 * Wires the shared MCP transport.
 *
 * Owns the single MCP endpoint (`/mcp`, mounted under the app's global
 * prefix) and the per-request server factory. Tools are contributed by the
 * app's own feature modules (tagged with `@McpTool()`) and discovered at
 * bootstrap via `DiscoveryModule`, so this module has no per-app dependency.
 *
 * @example
 * ```ts
 * // No auth — server-wide identity only, e.g. { requestId }.
 * McpModule.forRoot({ name: 'my-service', version: '1.0.0' })
 *
 * // With auth/tenancy — provide your own context builder.
 * McpModule.forRoot({
 *   name: 'my-service',
 *   version: '1.0.0',
 *   contextBuilder: MyAuthedMcpContextBuilder,
 * })
 * ```
 */
@Module({})
export class McpModule {
  static forRoot(options: IMcpModuleOptions): DynamicModule {
    return {
      module: McpModule,
      imports: [DiscoveryModule],
      controllers: [McpController],
      providers: [
        { provide: MCP_MODULE_OPTIONS, useValue: options },
        {
          provide: MCP_CONTEXT_BUILDER,
          useClass: options.contextBuilder ?? DefaultMcpContextBuilder,
        },
        McpToolRegistry,
        McpServerFactory,
      ],
      exports: [McpToolRegistry, McpServerFactory],
    };
  }
}
