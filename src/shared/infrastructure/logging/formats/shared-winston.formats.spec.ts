import * as winston from 'winston';

import {
  createSharedConsoleLogFormat,
  createSharedJsonLogFormat,
} from './shared-winston.formats';

describe('createSharedJsonLogFormat', () => {
  it('produces a JSON string including timestamp, level and message', () => {
    const format = createSharedJsonLogFormat();

    const info = format.transform({
      level: 'info',
      message: 'hello world',
      [Symbol.for('level')]: 'info',
    } as winston.Logform.TransformableInfo) as
      | (winston.Logform.TransformableInfo & { [key: string]: unknown })
      | boolean;

    expect(info).not.toBe(false);
    const transformed = info as winston.Logform.TransformableInfo & {
      timestamp: string;
    };
    expect(transformed.level).toBe('info');
    expect(transformed.message).toBe('hello world');
    expect(transformed.timestamp).toEqual(expect.any(String));
  });

  it('includes the error stack when logging an Error', () => {
    const format = createSharedJsonLogFormat();
    const error = new Error('boom');

    const info = format.transform({
      level: 'error',
      message: error,
      [Symbol.for('level')]: 'error',
    } as unknown as winston.Logform.TransformableInfo) as winston.Logform.TransformableInfo & {
      stack?: string;
    };

    expect(info.stack).toContain('boom');
  });
});

describe('createSharedConsoleLogFormat', () => {
  function render(
    info: Partial<{
      timestamp: string;
      level: string;
      message: unknown;
      context: string;
      trace: string;
      stack: string;
    }>,
  ): string {
    const format = createSharedConsoleLogFormat();
    // `colorize` requires the raw level to already be set; feed a
    // pre-built TransformableInfo straight into the pipeline the same way
    // winston would internally.
    const result = format.transform({
      level: info.level ?? 'info',
      message: info.message ?? '',
      timestamp: info.timestamp,
      context: info.context,
      trace: info.trace,
      stack: info.stack,
      [Symbol.for('level')]: info.level ?? 'info',
      [Symbol.for('message')]: undefined,
    } as unknown as winston.Logform.TransformableInfo);

    return String(
      (result as winston.Logform.TransformableInfo)[Symbol.for('message')],
    );
  }

  it('formats a plain string message with timestamp and level', () => {
    const output = render({
      level: 'info',
      message: 'server started',
    });

    // `winston.format.timestamp()` stamps the current time itself (any value
    // we pass in is overwritten), so assert on shape rather than the exact
    // value, plus the level and message text.
    expect(output).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    expect(output).toContain('server started');
  });

  it('includes the context label in cyan when present', () => {
    const output = render({
      timestamp: '2026-07-16 10:00:00',
      level: 'info',
      message: 'ready',
      context: 'Bootstrap',
    });

    expect(output).toContain('[Bootstrap]');
  });

  it('omits the context label when absent', () => {
    const output = render({
      timestamp: '2026-07-16 10:00:00',
      level: 'info',
      message: 'ready',
    });

    expect(output).not.toContain('[undefined]');
  });

  it('appends the trace when present', () => {
    const output = render({
      timestamp: '2026-07-16 10:00:00',
      level: 'warn',
      message: 'slow request',
      trace: 'at handler (file.ts:1:1)',
    });

    expect(output).toContain('at handler (file.ts:1:1)');
  });

  it('appends the stack when present', () => {
    const output = render({
      timestamp: '2026-07-16 10:00:00',
      level: 'error',
      message: 'failed',
      stack: 'Error: failed\n  at x (file.ts:1:1)',
    });

    expect(output).toContain('Error: failed');
  });

  it('stringifies a non-string message', () => {
    const output = render({
      timestamp: '2026-07-16 10:00:00',
      level: 'info',
      message: { foo: 'bar' },
    });

    expect(output).toContain('{"foo":"bar"}');
  });
});
