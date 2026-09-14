import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { REQUIRES_TENANT_PERMISSION_KEY } from '../../domain/constants/requires-tenant-permission.constant';
import { HasTenantMemberships } from '../../domain/types/tenant-membership-claim.type';
import {
  defaultResolveTenantId,
  getTenantAuthenticatedRequest,
} from '../context/tenant-execution-context';

export interface TenantPermissionGuardOptions<TPermission extends string> {
  /**
   * This app's own `TenantRole -> Permission[]` mapping. Keyed by the raw
   * role string carried in the JWT's `tenants` claim (`account-api`'s fixed
   * `OWNER` | `ADMIN` | `MEMBER`) — what each role unlocks is entirely up to
   * the app providing this map.
   */
  rolePermissions: Record<string, TPermission[]>;
  /**
   * How to resolve the target `tenantId` for the current request. Defaults
   * to `account-api`'s own convention (REST `:tenantId` param, GraphQL
   * top-level `tenantId` or `input.tenantId` arg) — override when your
   * app's routes/args name it differently.
   */
  resolveTenantId?: (context: ExecutionContext) => string | undefined;
}

/**
 * Builds a tenant-scoped permission guard for your own app. Not a
 * one-size-fits-all guard class: every app has its own permission enum and
 * its own rules for what each `TenantRole` grants, so this factory takes
 * that app-specific map and returns a ready-to-use `CanActivate` class —
 * the mechanism (read `@RequiresTenantPermission()` metadata, resolve the
 * caller's membership for the target tenant from `request.user.tenants`,
 * compare against the map) is the only part shared across apps.
 *
 * Must run after whatever guard populates `request.user` from a verified
 * `account-api` access token (e.g. your app's own JWT guard) — this guard
 * never verifies the token itself, only reads the already-decoded claims.
 *
 * @example
 * ```ts
 * export const GardenPermissionGuard = createTenantPermissionGuard({
 *   rolePermissions: GARDEN_ROLE_PERMISSIONS, // Record<TenantRoleEnum, GardenPermissionEnum[]>
 * });
 *
 * @UseGuards(JwtAuthGuard, GardenPermissionGuard)
 * @RequiresTenantPermission(GardenPermissionEnum.DELETE_PLANT)
 * async deletePlant() { ... }
 * ```
 */
export function createTenantPermissionGuard<TPermission extends string>(
  options: TenantPermissionGuardOptions<TPermission>,
): Type<CanActivate> {
  const resolveTenantId = options.resolveTenantId ?? defaultResolveTenantId;

  @Injectable()
  class TenantPermissionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
      const requiredPermission = this.reflector.getAllAndOverride<
        TPermission | undefined
      >(REQUIRES_TENANT_PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredPermission) {
        return true;
      }

      const tenantId = resolveTenantId(context);
      const request =
        getTenantAuthenticatedRequest<HasTenantMemberships>(context);
      const membership = request.user?.tenants?.find(
        (tenant) => tenant.tenantId === tenantId,
      );

      if (!membership) {
        throw new ForbiddenException(
          `Caller has no membership for tenant ${tenantId}`,
        );
      }

      const grantedPermissions = options.rolePermissions[membership.role] ?? [];
      if (!grantedPermissions.includes(requiredPermission)) {
        throw new ForbiddenException(
          `Role ${membership.role} does not grant permission ${requiredPermission}`,
        );
      }

      return true;
    }
  }

  return TenantPermissionGuard;
}
