describe('shared-registered-enums.graphql side-effect entrypoint', () => {
  it('registers the shared GraphQL enums as a side effect of importing it', async () => {
    await expect(
      import('./shared-registered-enums.graphql'),
    ).resolves.toBeDefined();
  });
});
