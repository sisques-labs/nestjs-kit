import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

import { HasTenantMemberships } from '../../domain/types/tenant-membership-claim.type';

export type TenantAuthenticatedRequest<
  TUser extends HasTenantMemberships = HasTenantMemberships,
> = Request & { user?: TUser };

function isGraphQlContext(context: ExecutionContext): boolean {
  return context.getType<string>() === 'graphql';
}

/**
 * Pulls the authenticated request out of an `ExecutionContext` for both
 * REST and GraphQL executions — a GraphQL `ExecutionContext` has no HTTP
 * request of its own, so the real `req` is read from the GraphQL context
 * object instead (the shape every consumer app's `GraphQLModule.forRoot`
 * already needs: `context: ({ req, res }) => ({ req, res })`).
 */
export function getTenantAuthenticatedRequest<
  TUser extends HasTenantMemberships = HasTenantMemberships,
>(context: ExecutionContext): TenantAuthenticatedRequest<TUser> {
  if (isGraphQlContext(context)) {
    return GqlExecutionContext.create(context).getContext<{
      req: TenantAuthenticatedRequest<TUser>;
    }>().req;
  }
  return context.switchToHttp().getRequest<TenantAuthenticatedRequest<TUser>>();
}

/**
 * Default `tenantId` resolution, matching the convention every tenant-scoped
 * endpoint in `account-api` already follows: the REST route param
 * `tenantId`, or — for GraphQL — a top-level `tenantId` arg or a `tenantId`
 * field nested under `input`. Pass your own `resolveTenantId` to
 * `createTenantPermissionGuard()` if your app names things differently
 * (e.g. a REST param called `gardenId`).
 */
export function defaultResolveTenantId(
  context: ExecutionContext,
): string | undefined {
  if (isGraphQlContext(context)) {
    const args =
      GqlExecutionContext.create(context).getArgs<Record<string, unknown>>();
    if (typeof args.tenantId === 'string') {
      return args.tenantId;
    }
    const input = args.input as Record<string, unknown> | undefined;
    if (input && typeof input.tenantId === 'string') {
      return input.tenantId;
    }
    return undefined;
  }

  const request = context.switchToHttp().getRequest<Request>();
  const tenantId = request.params?.tenantId;
  return typeof tenantId === 'string' ? tenantId : undefined;
}
