import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { getAuthenticatedRequest } from '../context/auth-client-execution-context';

/**
 * Requires the caller's access token to carry `platformAdmin: true`. Must
 * run after `JwtAuthGuard` (which populates `request.user`). Generalizes
 * `account-api`'s own `PlatformAdminGuard`. Works for both REST controllers
 * and GraphQL resolvers.
 */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = getAuthenticatedRequest(context);

    if (!request.user?.platformAdmin) {
      throw new ForbiddenException('Platform admin access required');
    }

    return true;
  }
}
