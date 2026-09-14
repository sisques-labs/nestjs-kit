import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { PlatformAdminGuard } from './infrastructure/guards/platform-admin.guard';
import { AuthClientModule } from './auth-client.module';

describe('AuthClientModule.forRoot', () => {
  const dynamicModule = AuthClientModule.forRoot({ secret: 'test-secret' });

  it('registers itself as a global module', () => {
    expect(dynamicModule.global).toBe(true);
  });

  it('provides and exports JwtAuthGuard and PlatformAdminGuard', () => {
    expect(dynamicModule.providers).toContain(JwtAuthGuard);
    expect(dynamicModule.providers).toContain(PlatformAdminGuard);
    expect(dynamicModule.exports).toContain(JwtAuthGuard);
    expect(dynamicModule.exports).toContain(PlatformAdminGuard);
  });
});

describe('AuthClientModule.forRootAsync', () => {
  const dynamicModule = AuthClientModule.forRootAsync({
    useFactory: () => ({ secret: 'test-secret' }),
  });

  it('registers itself as a global module', () => {
    expect(dynamicModule.global).toBe(true);
  });

  it('provides and exports JwtAuthGuard and PlatformAdminGuard', () => {
    expect(dynamicModule.providers).toContain(JwtAuthGuard);
    expect(dynamicModule.providers).toContain(PlatformAdminGuard);
    expect(dynamicModule.exports).toContain(JwtAuthGuard);
    expect(dynamicModule.exports).toContain(PlatformAdminGuard);
  });
});
