import { DynamicModule, Module } from '@nestjs/common';
import {
  JwtModule,
  JwtModuleAsyncOptions,
  JwtModuleOptions,
} from '@nestjs/jwt';

import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { PlatformAdminGuard } from './infrastructure/guards/platform-admin.guard';

/**
 * Cross-cutting JWT infrastructure for verifying Sisques Account access
 * tokens: wraps `@nestjs/jwt`'s `JwtModule` with the same secret Sisques
 * Account signs with, and exports `JwtAuthGuard`/`PlatformAdminGuard` ready
 * to use. Register once, globally (`forRoot`/`forRootAsync`), typically from
 * the app's core/shared module — every other module gets `JwtAuthGuard` and
 * `PlatformAdminGuard` without re-importing this module. Generalizes
 * `account-api`'s own `SecurityModule`.
 *
 * @example
 * ```ts
 * AuthClientModule.forRootAsync({
 *   inject: [ConfigService],
 *   useFactory: (config: ConfigService): JwtModuleOptions => ({
 *     secret: config.getOrThrow<string>('auth.jwtSecret'),
 *   }),
 * })
 * ```
 */
@Module({})
export class AuthClientModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: AuthClientModule,
      global: true,
      imports: [JwtModule.register(options)],
      providers: [JwtAuthGuard, PlatformAdminGuard],
      exports: [JwtModule, JwtAuthGuard, PlatformAdminGuard],
    };
  }

  static forRootAsync(options: JwtModuleAsyncOptions): DynamicModule {
    return {
      module: AuthClientModule,
      global: true,
      imports: [JwtModule.registerAsync(options)],
      providers: [JwtAuthGuard, PlatformAdminGuard],
      exports: [JwtModule, JwtAuthGuard, PlatformAdminGuard],
    };
  }
}
