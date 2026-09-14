// ─── RBAC (tenant-scoped permissions) ──────────────────────────────────────────
// Separate entry point so importing '@sisques-labs/nestjs-kit' does not
// require the optional `@nestjs/graphql` and `express` peer dependencies.
// Import from '@sisques-labs/nestjs-kit/rbac' when you build your own
// permission model on top of account-api's tenant roles.
//
// This module ships the *mechanism* only (read a required-permission marker,
// resolve the caller's tenant membership from the request, check it against
// a map) — never a permission enum or a role->permission mapping. Those are
// inherently app-specific: define your own permission type and pass your own
// `rolePermissions` map to `createTenantPermissionGuard()`.

export * from '../shared/rbac/domain/constants/requires-tenant-permission.constant';
export * from '../shared/rbac/domain/types/tenant-membership-claim.type';

export * from '../shared/rbac/infrastructure/context/tenant-execution-context';
export * from '../shared/rbac/infrastructure/decorators/requires-tenant-permission.decorator';
export * from '../shared/rbac/infrastructure/guards/tenant-permission-guard.factory';
