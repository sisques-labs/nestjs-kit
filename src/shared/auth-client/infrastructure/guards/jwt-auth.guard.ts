import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { IAccessTokenClaims } from '../../domain/types/access-token-claims.interface';
import {
  extractBearerToken,
  getAuthenticatedRequest,
} from '../context/auth-client-execution-context';

/**
 * Requires a valid Sisques Account access token (`Authorization: Bearer`).
 * Verifies with the app's own `JwtService` — configured via
 * `AuthClientModule.forRoot()`/`forRootAsync()` with the same secret
 * Sisques Account signs with — since apps never talk to the identity
 * provider directly, only trust tokens Sisques Account already issued.
 * Generalizes `account-api`'s own `JwtAuthGuard`. Works for both REST
 * controllers and GraphQL resolvers.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = getAuthenticatedRequest(context);
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      request.user = this.jwtService.verify<IAccessTokenClaims>(token);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
