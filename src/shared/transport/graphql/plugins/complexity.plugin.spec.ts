import { GraphQLError } from 'graphql';

import { ComplexityPlugin } from '@/shared/transport/graphql/plugins/complexity.plugin';

const getComplexityMock = jest.fn();

jest.mock('graphql-query-complexity', () => ({
  getComplexity: (...args: unknown[]) => getComplexityMock(...args),
  fieldExtensionsEstimator: jest.fn(() => 'field-extensions-estimator'),
  simpleEstimator: jest.fn((options: unknown) => ({
    estimator: 'simple',
    ...(options as object),
  })),
}));

describe('ComplexityPlugin', () => {
  beforeEach(() => {
    getComplexityMock.mockReset();
  });

  it('does not throw when complexity is within the allowed maximum', async () => {
    getComplexityMock.mockReturnValue(10);

    const plugin = new ComplexityPlugin();
    const listener = await plugin.requestDidStart({
      schema: {} as any,
    } as any);

    await expect(
      listener.didResolveOperation!({
        request: { operationName: 'GetThing', variables: {} },
        document: {} as any,
      } as any),
    ).resolves.toBeUndefined();

    expect(getComplexityMock).toHaveBeenCalledWith(
      expect.objectContaining({
        operationName: 'GetThing',
      }),
    );
  });

  it('throws a GraphQLError when complexity exceeds the maximum', async () => {
    getComplexityMock.mockReturnValue(1001);

    const plugin = new ComplexityPlugin();
    const listener = await plugin.requestDidStart({
      schema: {} as any,
    } as any);

    await expect(
      listener.didResolveOperation!({
        request: { operationName: 'GetThing', variables: {} },
        document: {} as any,
      } as any),
    ).rejects.toThrow(GraphQLError);
  });
});
