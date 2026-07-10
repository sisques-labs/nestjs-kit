import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { IMcpContextBuilder } from '../../domain/interfaces/mcp-context-builder.interface';
import { IBaseMcpToolContext } from '../../domain/interfaces/base-mcp-tool-context.interface';

/**
 * Default {@link IMcpContextBuilder} used when a `McpModule.forRoot()` caller
 * doesn't provide its own — a bare request correlation id, no auth/tenancy.
 */
@Injectable()
export class DefaultMcpContextBuilder implements IMcpContextBuilder<IBaseMcpToolContext> {
  build(): IBaseMcpToolContext {
    return { requestId: randomUUID() };
  }
}
