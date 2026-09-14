import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  const buildContext = (authorization?: string): ExecutionContext => {
    const request = { headers: { authorization } };
    return {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  const buildGraphQLContext = (authorization?: string): ExecutionContext => {
    const request = { headers: { authorization } };
    return {
      getType: () => 'graphql',
      getArgs: () => [{}, {}, { req: request }, {}],
      getClass: () => JwtAuthGuard,
      getHandler: () => (): void => undefined,
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;
    guard = new JwtAuthGuard(jwtService);
  });

  it('throws UnauthorizedException when no Authorization header is present', () => {
    expect(() => guard.canActivate(buildContext())).toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when the header is not a Bearer token', () => {
    expect(() => guard.canActivate(buildContext('Basic abc123'))).toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when the token fails verification', () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('invalid');
    });

    expect(() => guard.canActivate(buildContext('Bearer bad-token'))).toThrow(
      UnauthorizedException,
    );
  });

  it('attaches the decoded claims to the request and allows access', () => {
    const claims = {
      sub: 'user-1',
      email: 'user@example.com',
      platformAdmin: false,
      tenants: [],
    };
    jwtService.verify.mockReturnValue(claims);
    const context = buildContext('Bearer good-token');

    expect(guard.canActivate(context)).toBe(true);
    const request = context.switchToHttp().getRequest() as { user: unknown };
    expect(request.user).toEqual(claims);
  });

  it('reads the request from the GraphQL context and allows access', () => {
    const claims = {
      sub: 'user-1',
      email: 'user@example.com',
      platformAdmin: false,
      tenants: [],
    };
    jwtService.verify.mockReturnValue(claims);
    const context = buildGraphQLContext('Bearer good-token');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws UnauthorizedException in GraphQL context when no Authorization header is present', () => {
    expect(() => guard.canActivate(buildGraphQLContext())).toThrow(
      UnauthorizedException,
    );
  });
});
