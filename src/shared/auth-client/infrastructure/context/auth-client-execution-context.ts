import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

import { IAccessTokenClaims } from '../../domain/types/access-token-claims.interface';

export type AuthenticatedRequest = Request & { user?: IAccessTokenClaims };

function isGraphQlContext(context: ExecutionContext): boolean {
  return context.getType<string>() === 'graphql';
}

/**
 * Pulls the underlying request out of an `ExecutionContext` for both REST
 * and GraphQL executions — a GraphQL `ExecutionContext` has no HTTP request
 * of its own, so the real `req` is read from the GraphQL context object
 * instead (the shape every consuming app's `GraphQLModule.forRoot` already
 * needs: `context: ({ req, res }) => ({ req, res })`). Kept separate from
 * `rbac`'s `getTenantAuthenticatedRequest` — that helper is generic over
 * `HasTenantMemberships` and has no notion of the full access-token shape
 * this module verifies and populates.
 */
export function getAuthenticatedRequest(
  context: ExecutionContext,
): AuthenticatedRequest {
  if (isGraphQlContext(context)) {
    return GqlExecutionContext.create(context).getContext<{
      req: AuthenticatedRequest;
    }>().req;
  }
  return context.switchToHttp().getRequest<AuthenticatedRequest>();
}

/** Reads the `Authorization: Bearer <token>` header, if present. */
export function extractBearerToken(
  request: AuthenticatedRequest,
): string | undefined {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice('Bearer '.length);
}
