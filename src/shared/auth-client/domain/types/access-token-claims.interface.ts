import type {
  HasTenantMemberships,
  TenantMembershipClaim,
} from '../../../rbac/domain/types/tenant-membership-claim.type';

/**
 * Payload of the access token Sisques Account (the platform's shared
 * identity/tenancy service, see `account-api`) issues — the wire contract
 * every consuming app's `JwtAuthGuard` verifies and populates
 * `request.user` with. Extends `rbac`'s `HasTenantMemberships` (narrowing
 * `tenants` to required, since a verified token always carries the claim)
 * so the same object satisfies `createTenantPermissionGuard()`'s checks
 * without any adapting.
 */
export interface IAccessTokenClaims extends HasTenantMemberships {
  sub: string;
  email: string;
  platformAdmin: boolean;
  tenants: TenantMembershipClaim[];
}
