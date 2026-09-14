import { SetMetadata } from '@nestjs/common';

import { REQUIRES_TENANT_PERMISSION_KEY } from '../../domain/constants/requires-tenant-permission.constant';

/**
 * Marks a REST controller method or GraphQL resolver method with the
 * app-defined permission it requires. Read by the guard built with
 * `createTenantPermissionGuard()` via `Reflector` — mirrors Nest's own
 * `@Roles()` cookbook pattern. Has no effect unless that guard also runs on
 * the same handler, after whatever guard populates `request.user` (e.g. a
 * JWT guard verifying an `account-api`-issued access token).
 *
 * `TPermission` is your own app's permission type (typically a string
 * enum) — this package never defines what permissions exist, only the
 * mechanism for requiring one.
 */
export function RequiresTenantPermission<TPermission extends string>(
  permission: TPermission,
): MethodDecorator & ClassDecorator {
  return SetMetadata(REQUIRES_TENANT_PERMISSION_KEY, permission);
}
