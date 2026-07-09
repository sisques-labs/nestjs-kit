import { DefaultMcpContextBuilder } from './default-mcp-context-builder.service';

describe('DefaultMcpContextBuilder', () => {
  it('returns a context with a requestId', () => {
    const builder = new DefaultMcpContextBuilder();

    const context = builder.build();

    expect(typeof context.requestId).toBe('string');
    expect((context.requestId as string).length).toBeGreaterThan(0);
  });

  it('generates a distinct requestId per call', () => {
    const builder = new DefaultMcpContextBuilder();

    const first = builder.build();
    const second = builder.build();

    expect(first.requestId).not.toBe(second.requestId);
  });
});
