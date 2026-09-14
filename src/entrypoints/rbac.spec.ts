import * as RbacEntrypoint from './rbac';

describe('entrypoints/rbac barrel', () => {
  it('re-exports the metadata key, decorator, context helpers and guard factory', () => {
    expect(RbacEntrypoint.REQUIRES_TENANT_PERMISSION_KEY).toBeDefined();
    expect(RbacEntrypoint.RequiresTenantPermission).toBeDefined();
    expect(RbacEntrypoint.getTenantAuthenticatedRequest).toBeDefined();
    expect(RbacEntrypoint.defaultResolveTenantId).toBeDefined();
    expect(RbacEntrypoint.createTenantPermissionGuard).toBeDefined();
  });
});
