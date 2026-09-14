import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { REQUIRES_TENANT_PERMISSION_KEY } from '../../domain/constants/requires-tenant-permission.constant';
import { createTenantPermissionGuard } from './tenant-permission-guard.factory';

enum TestPermission {
  VIEW = 'VIEW',
  MANAGE = 'MANAGE',
  DELETE = 'DELETE',
}

const ROLE_PERMISSIONS: Record<string, TestPermission[]> = {
  OWNER: [TestPermission.VIEW, TestPermission.MANAGE, TestPermission.DELETE],
  ADMIN: [TestPermission.VIEW, TestPermission.MANAGE],
  MEMBER: [TestPermission.VIEW],
};

function buildContext(options: {
  requiredPermission?: TestPermission;
  tenantId?: string;
  user?: { tenants?: Array<{ tenantId: string; role: string }> };
}): ExecutionContext {
  const request = {
    params: { tenantId: options.tenantId },
    user: options.user,
  };
  const handler = () => undefined;
  const klass = class {};

  return {
    getType: () => 'http',
    getHandler: () => handler,
    getClass: () => klass,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('createTenantPermissionGuard', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;
  });

  function mockRequiredPermission(
    permission: TestPermission | undefined,
  ): void {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation(
      (key: string) =>
        key === REQUIRES_TENANT_PERMISSION_KEY ? permission : undefined,
    );
  }

  it('allows the request through when the handler requires no permission', () => {
    mockRequiredPermission(undefined);
    const GuardClass = createTenantPermissionGuard({
      rolePermissions: ROLE_PERMISSIONS,
    });
    const guard = new GuardClass(reflector);

    const context = buildContext({
      tenantId: 'tenant-1',
      user: { tenants: [] },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("allows the request when the caller's role grants the required permission", () => {
    mockRequiredPermission(TestPermission.MANAGE);
    const GuardClass = createTenantPermissionGuard({
      rolePermissions: ROLE_PERMISSIONS,
    });
    const guard = new GuardClass(reflector);

    const context = buildContext({
      tenantId: 'tenant-1',
      user: { tenants: [{ tenantId: 'tenant-1', role: 'ADMIN' }] },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws ForbiddenException when the caller has no membership for the target tenant', () => {
    mockRequiredPermission(TestPermission.VIEW);
    const GuardClass = createTenantPermissionGuard({
      rolePermissions: ROLE_PERMISSIONS,
    });
    const guard = new GuardClass(reflector);

    const context = buildContext({
      tenantId: 'tenant-1',
      user: { tenants: [{ tenantId: 'tenant-2', role: 'OWNER' }] },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when the role does not grant the required permission', () => {
    mockRequiredPermission(TestPermission.DELETE);
    const GuardClass = createTenantPermissionGuard({
      rolePermissions: ROLE_PERMISSIONS,
    });
    const guard = new GuardClass(reflector);

    const context = buildContext({
      tenantId: 'tenant-1',
      user: { tenants: [{ tenantId: 'tenant-1', role: 'ADMIN' }] },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('uses a custom resolveTenantId when provided', () => {
    mockRequiredPermission(TestPermission.VIEW);
    const resolveTenantId = jest.fn().mockReturnValue('tenant-1');
    const GuardClass = createTenantPermissionGuard({
      rolePermissions: ROLE_PERMISSIONS,
      resolveTenantId,
    });
    const guard = new GuardClass(reflector);

    const context = buildContext({
      user: { tenants: [{ tenantId: 'tenant-1', role: 'MEMBER' }] },
    });

    expect(guard.canActivate(context)).toBe(true);
    expect(resolveTenantId).toHaveBeenCalledWith(context);
  });

  it('treats a missing permission map entry for a role as no permissions', () => {
    mockRequiredPermission(TestPermission.VIEW);
    const GuardClass = createTenantPermissionGuard({
      rolePermissions: ROLE_PERMISSIONS,
    });
    const guard = new GuardClass(reflector);

    const context = buildContext({
      tenantId: 'tenant-1',
      user: { tenants: [{ tenantId: 'tenant-1', role: 'UNKNOWN_ROLE' }] },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
