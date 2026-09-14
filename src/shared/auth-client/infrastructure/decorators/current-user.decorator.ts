import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IAccessTokenClaims } from '../../domain/types/access-token-claims.interface';
import { getAuthenticatedRequest } from '../context/auth-client-execution-context';

export interface CurrentUserPayload {
  userId: string;
  email: string;
  platformAdmin: boolean;
  tenants: Array<{ tenantId: string; role: string }>;
}

/**
 * Extracted from the `@CurrentUser()` factory so it can be unit tested
 * directly — `createParamDecorator` factories aren't callable as plain
 * functions. Requires `JwtAuthGuard` to have run first (populates
 * `request.user`). Generalizes `account-api`'s own `@CurrentUser()`.
 */
export function extractCurrentUser(
  _data: unknown,
  context: ExecutionContext,
): CurrentUserPayload {
  const claims = getAuthenticatedRequest(context).user as IAccessTokenClaims;

  return {
    userId: claims.sub,
    email: claims.email,
    platformAdmin: claims.platformAdmin,
    tenants: claims.tenants,
  };
}

/** Requires `JwtAuthGuard` to have run first (populates `request.user`). */
export const CurrentUser = createParamDecorator(extractCurrentUser);
