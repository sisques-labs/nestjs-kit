/**
 * Shape of one entry in the `tenants` claim of the JWT issued by
 * `account-api` (the platform's identity/tenancy service) — the wire
 * contract every consumer app's authorization layer reads from
 * `request.user.tenants`. `role` is one of `account-api`'s fixed tenant
 * roles (`OWNER` | `ADMIN` | `MEMBER`), carried as a plain string here so
 * this package never needs to depend on `account-api`'s own enum.
 */
export interface TenantMembershipClaim {
  tenantId: string;
  role: string;
}

/**
 * Minimal shape `TenantPermissionGuard` needs from `request.user`. Extend
 * this in your own app's access-token claims interface — the guard only
 * ever reads the `tenants` array.
 */
export interface HasTenantMemberships {
  tenants?: TenantMembershipClaim[];
}
