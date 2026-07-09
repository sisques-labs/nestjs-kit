import { Type } from '@nestjs/common';

import { IMcpContextBuilder } from './domain/interfaces/mcp-context-builder.interface';

export interface IMcpModuleOptions {
  /** Server identity advertised to MCP clients during the initialize handshake. */
  name: string;
  /** Server version advertised to MCP clients during the initialize handshake. */
  version: string;
  /**
   * Builds the per-request tool context. Defaults to `DefaultMcpContextBuilder`
   * (`{ requestId }`) when omitted — override once the app has auth/tenancy to
   * resolve, e.g. `{ contextBuilder: MyAuthedMcpContextBuilder }`. The class is
   * instantiated by Nest's DI container, so its own constructor dependencies
   * (guards' services, `ConfigService`, ...) are injected normally.
   */
  contextBuilder?: Type<IMcpContextBuilder>;
}
