import * as AuthClientEntrypoint from './auth-client';

describe('entrypoints/auth-client barrel', () => {
  it('re-exports the execution-context helpers, decorator, guards and module', () => {
    expect(AuthClientEntrypoint.getAuthenticatedRequest).toBeDefined();
    expect(AuthClientEntrypoint.extractBearerToken).toBeDefined();
    expect(AuthClientEntrypoint.CurrentUser).toBeDefined();
    expect(AuthClientEntrypoint.extractCurrentUser).toBeDefined();
    expect(AuthClientEntrypoint.JwtAuthGuard).toBeDefined();
    expect(AuthClientEntrypoint.PlatformAdminGuard).toBeDefined();
    expect(AuthClientEntrypoint.AuthClientModule).toBeDefined();
  });
});
