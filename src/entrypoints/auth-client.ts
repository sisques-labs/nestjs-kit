// ─── Auth Client (Sisques Account JWT verification) ────────────────────────────
// Separate entry point so importing '@sisques-labs/nestjs-kit' does not
// require the optional `@nestjs/jwt` and `express` peer dependencies.
// Import from '@sisques-labs/nestjs-kit/auth-client' to verify access tokens
// issued by Sisques Account (the platform's shared identity/tenancy
// service) — this module never talks to the identity provider itself, only
// trusts tokens Sisques Account already signed. Pair with
// '@sisques-labs/nestjs-kit/rbac' for tenant-scoped authorization on top of
// the same `request.user.tenants` claim this module populates.

export * from '../shared/auth-client/domain/types/access-token-claims.interface';

export * from '../shared/auth-client/infrastructure/context/auth-client-execution-context';
export * from '../shared/auth-client/infrastructure/decorators/current-user.decorator';
export * from '../shared/auth-client/infrastructure/guards/jwt-auth.guard';
export * from '../shared/auth-client/infrastructure/guards/platform-admin.guard';

export * from '../shared/auth-client/auth-client.module';
