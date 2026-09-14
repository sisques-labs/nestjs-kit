import { ExecutionContext } from '@nestjs/common';

import {
  extractBearerToken,
  getAuthenticatedRequest,
} from './auth-client-execution-context';

describe('getAuthenticatedRequest', () => {
  it('reads the request from the HTTP context', () => {
    const request = { headers: {} };
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    expect(getAuthenticatedRequest(context)).toBe(request);
  });

  it('reads the request from the GraphQL context', () => {
    const request = { headers: {} };
    const context = {
      getType: () => 'graphql',
      getArgs: () => [{}, {}, { req: request }, {}],
      getClass: () => undefined,
      getHandler: () => (): void => undefined,
    } as unknown as ExecutionContext;

    expect(getAuthenticatedRequest(context)).toBe(request);
  });
});

describe('extractBearerToken', () => {
  it('returns undefined when there is no Authorization header', () => {
    expect(extractBearerToken({ headers: {} } as never)).toBeUndefined();
  });

  it('returns undefined when the header is not a Bearer token', () => {
    expect(
      extractBearerToken({
        headers: { authorization: 'Basic abc123' },
      } as never),
    ).toBeUndefined();
  });

  it('returns the token when the header is a Bearer token', () => {
    expect(
      extractBearerToken({
        headers: { authorization: 'Bearer good-token' },
      } as never),
    ).toBe('good-token');
  });
});
