import { ExecutionContext } from '@nestjs/common';

import {
  defaultResolveTenantId,
  getTenantAuthenticatedRequest,
} from './tenant-execution-context';

function buildHttpContext(request: unknown): ExecutionContext {
  return {
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

// GqlExecutionContext.create() reads the handler's raw invocation args —
// the (root, args, context, info) tuple GraphQL resolvers receive — off
// context.getArgs(), then exposes each slot via its own getArgs()/getContext()/
// getInfo(). Mirrors the same tuple shape the metrics interceptor spec uses.
function buildGraphQlContext(
  args: Record<string, unknown>,
  req: unknown,
): ExecutionContext {
  return {
    getType: () => 'graphql',
    getArgs: () => [null, args, { req }, {}],
    getClass: () => class {},
    getHandler: () => () => undefined,
  } as unknown as ExecutionContext;
}

describe('getTenantAuthenticatedRequest', () => {
  it('reads the request from switchToHttp() for a REST execution context', () => {
    const request = { user: { tenants: [] } };
    expect(getTenantAuthenticatedRequest(buildHttpContext(request))).toBe(
      request,
    );
  });

  it('reads req off the GraphQL context object for a GraphQL execution context', () => {
    const request = { user: { tenants: [] } };
    expect(
      getTenantAuthenticatedRequest(buildGraphQlContext({}, request)),
    ).toBe(request);
  });
});

describe('defaultResolveTenantId', () => {
  it('reads tenantId from the REST route params', () => {
    const context = buildHttpContext({ params: { tenantId: 'tenant-1' } });
    expect(defaultResolveTenantId(context)).toBe('tenant-1');
  });

  it('returns undefined when the REST route has no tenantId param', () => {
    const context = buildHttpContext({ params: {} });
    expect(defaultResolveTenantId(context)).toBeUndefined();
  });

  it('reads a top-level tenantId GraphQL arg', () => {
    const context = buildGraphQlContext({ tenantId: 'tenant-1' }, {});
    expect(defaultResolveTenantId(context)).toBe('tenant-1');
  });

  it('reads a tenantId nested under a GraphQL input arg', () => {
    const context = buildGraphQlContext(
      { input: { tenantId: 'tenant-1' } },
      {},
    );
    expect(defaultResolveTenantId(context)).toBe('tenant-1');
  });

  it('returns undefined when no GraphQL arg carries a tenantId', () => {
    const context = buildGraphQlContext({}, {});
    expect(defaultResolveTenantId(context)).toBeUndefined();
  });
});
