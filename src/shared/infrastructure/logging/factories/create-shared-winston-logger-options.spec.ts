import { mkdtempSync } from 'fs';
import * as os from 'os';
import * as path from 'path';

import * as winston from 'winston';

import {
  createSharedWinstonLoggerOptions,
  defaultSharedWinstonLoggerOptions,
  mergeSharedWinstonLoggerOptions,
} from './create-shared-winston-logger-options';

describe('createSharedWinstonLoggerOptions', () => {
  const originalLogLevel = process.env.LOG_LEVEL;

  afterEach(() => {
    if (originalLogLevel === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = originalLogLevel;
    }
  });

  it('defaults to console + daily-rotate-file transports with level "info" and service "api"', () => {
    delete process.env.LOG_LEVEL;

    const options = createSharedWinstonLoggerOptions();

    expect(options.level).toBe('info');
    expect(options.defaultMeta).toEqual({ service: 'api' });
    expect(options.format).toBeDefined();
    expect(options.transports).toHaveLength(2);
    expect(options.exceptionHandlers).toBeUndefined();
    expect(options.rejectionHandlers).toBeUndefined();
  });

  it('falls back to process.env.LOG_LEVEL when no explicit level is given', () => {
    process.env.LOG_LEVEL = 'debug';

    const options = createSharedWinstonLoggerOptions();

    expect(options.level).toBe('debug');
  });

  it('an explicit level option takes priority over process.env.LOG_LEVEL', () => {
    process.env.LOG_LEVEL = 'debug';

    const options = createSharedWinstonLoggerOptions({ level: 'warn' });

    expect(options.level).toBe('warn');
  });

  it('uses the given service name in defaultMeta when defaultMeta is not set', () => {
    const options = createSharedWinstonLoggerOptions({ service: 'my-app' });

    expect(options.defaultMeta).toEqual({ service: 'my-app' });
  });

  it('does not override an explicit defaultMeta.service with the service shorthand', () => {
    const options = createSharedWinstonLoggerOptions({
      service: 'my-app',
      defaultMeta: { service: 'explicit', region: 'eu' },
    });

    expect(options.defaultMeta).toEqual({
      service: 'explicit',
      region: 'eu',
    });
  });

  it('preserves defaultMeta as-is when it has keys other than service', () => {
    const options = createSharedWinstonLoggerOptions({
      defaultMeta: { region: 'eu' },
    });

    expect(options.defaultMeta).toEqual({ region: 'eu' });
  });

  it('disables the console transport when enableConsole is false', () => {
    const options = createSharedWinstonLoggerOptions({
      enableConsole: false,
    });

    expect(options.transports).toHaveLength(1);
  });

  it('disables the daily-rotate-file transport when enableDailyRotateFile is false', () => {
    const options = createSharedWinstonLoggerOptions({
      enableDailyRotateFile: false,
    });

    expect(options.transports).toHaveLength(1);
  });

  it('disables both transports when both flags are false, leaving only additionalTransports', () => {
    const extraTransport = new winston.transports.Console();

    const options = createSharedWinstonLoggerOptions({
      enableConsole: false,
      enableDailyRotateFile: false,
      additionalTransports: [extraTransport],
    });

    expect(options.transports).toEqual([extraTransport]);
  });

  it('appends additionalTransports after the default transports', () => {
    const extraTransport = new winston.transports.Console();

    const options = createSharedWinstonLoggerOptions({
      additionalTransports: [extraTransport],
    });

    expect(options.transports).toHaveLength(3);
    expect((options.transports as winston.transport[])[2]).toBe(extraTransport);
  });

  it('uses dailyRotate overrides for the file transport options', () => {
    const customFormat = winston.format.json();
    // winston-daily-rotate-file touches the filesystem on construction (log +
    // audit files); point it at the OS temp dir instead of the repo/cwd.
    const customFilename = path.join(
      mkdtempSync(path.join(os.tmpdir(), 'nestjs-kit-winston-')),
      '%DATE%.log',
    );

    const options = createSharedWinstonLoggerOptions({
      dailyRotate: {
        filename: customFilename,
        datePattern: 'YYYY-MM',
        zippedArchive: false,
        maxSize: '5m',
        maxFiles: '7d',
        format: customFormat,
      },
    });

    const transports = options.transports as Array<
      winston.transport & {
        dirname?: string;
        options?: Record<string, unknown>;
      }
    >;
    const dailyRotateTransport = transports.find(
      (transport) => transport.options?.datePattern !== undefined,
    );

    expect(dailyRotateTransport?.options?.filename).toBe(customFilename);
    expect(dailyRotateTransport?.options?.datePattern).toBe('YYYY-MM');
    expect(dailyRotateTransport?.options?.zippedArchive).toBe(false);
    expect(dailyRotateTransport?.options?.maxSize).toBe('5m');
    expect(dailyRotateTransport?.options?.maxFiles).toBe('7d');
  });

  it('uses custom jsonLogFormat/consoleFormat when provided', () => {
    const jsonLogFormat = winston.format.json();
    const consoleFormat = winston.format.simple();

    const options = createSharedWinstonLoggerOptions({
      jsonLogFormat,
      consoleFormat,
    });

    expect(options.format).toBe(jsonLogFormat);
  });

  it('sets exceptionHandlers/rejectionHandlers only when non-empty', () => {
    const handler = new winston.transports.Console();

    const withoutHandlers = createSharedWinstonLoggerOptions({
      exceptionHandlers: [],
      rejectionHandlers: [],
    });
    expect(withoutHandlers.exceptionHandlers).toBeUndefined();
    expect(withoutHandlers.rejectionHandlers).toBeUndefined();

    const withHandlers = createSharedWinstonLoggerOptions({
      exceptionHandlers: [handler],
      rejectionHandlers: [handler],
    });
    expect(withHandlers.exceptionHandlers).toEqual([handler]);
    expect(withHandlers.rejectionHandlers).toEqual([handler]);
  });

  it('throws a descriptive error if winston.transports.DailyRotateFile is missing', () => {
    const original = (
      winston.transports as unknown as { DailyRotateFile?: unknown }
    ).DailyRotateFile;
    delete (winston.transports as unknown as { DailyRotateFile?: unknown })
      .DailyRotateFile;

    try {
      expect(() =>
        createSharedWinstonLoggerOptions({ enableDailyRotateFile: true }),
      ).toThrow(/winston-daily-rotate-file/);
    } finally {
      (
        winston.transports as unknown as { DailyRotateFile?: unknown }
      ).DailyRotateFile = original;
    }
  });
});

describe('mergeSharedWinstonLoggerOptions', () => {
  it('shallow-merges options, with override values winning', () => {
    const base = createSharedWinstonLoggerOptions({ level: 'info' });
    const merged = mergeSharedWinstonLoggerOptions(base, { level: 'debug' });

    expect(merged.level).toBe('debug');
  });

  it('concatenates transports from base and override', () => {
    const base = createSharedWinstonLoggerOptions();
    const overrideTransport = new winston.transports.Console();

    const merged = mergeSharedWinstonLoggerOptions(base, {
      transports: [overrideTransport],
    });

    expect(merged.transports).toHaveLength(
      (base.transports as unknown[]).length + 1,
    );
    expect((merged.transports as winston.transport[]).at(-1)).toBe(
      overrideTransport,
    );
  });

  it('handles a single (non-array) transport on either side', () => {
    const base: winston.LoggerOptions = {
      transports: new winston.transports.Console(),
    };
    const overrideTransport = new winston.transports.Console();

    const merged = mergeSharedWinstonLoggerOptions(base, {
      transports: overrideTransport,
    });

    expect(merged.transports).toHaveLength(2);
  });

  it('merges defaultMeta shallowly, override wins on conflicting keys', () => {
    const base = createSharedWinstonLoggerOptions({
      defaultMeta: { service: 'api', region: 'eu' },
    });

    const merged = mergeSharedWinstonLoggerOptions(base, {
      defaultMeta: { service: 'override' },
    });

    expect(merged.defaultMeta).toEqual({
      service: 'override',
      region: 'eu',
    });
  });

  it('treats a non-object defaultMeta as empty on either side', () => {
    const base: winston.LoggerOptions = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- deliberately malformed input
      defaultMeta: 'not-an-object' as any,
      transports: [],
    };

    const merged = mergeSharedWinstonLoggerOptions(base, {
      defaultMeta: { service: 'x' },
    });

    expect(merged.defaultMeta).toEqual({ service: 'x' });
  });

  it('only overrides exceptionHandlers/rejectionHandlers when explicitly defined in override', () => {
    const handler = new winston.transports.Console();
    const base: winston.LoggerOptions = {
      transports: [],
      exceptionHandlers: [handler],
      rejectionHandlers: [handler],
    };

    const mergedWithoutOverride = mergeSharedWinstonLoggerOptions(base, {});
    expect(mergedWithoutOverride.exceptionHandlers).toEqual([handler]);
    expect(mergedWithoutOverride.rejectionHandlers).toEqual([handler]);

    const newHandler = new winston.transports.Console();
    const mergedWithOverride = mergeSharedWinstonLoggerOptions(base, {
      exceptionHandlers: [newHandler],
      rejectionHandlers: [newHandler],
    });
    expect(mergedWithOverride.exceptionHandlers).toEqual([newHandler]);
    expect(mergedWithOverride.rejectionHandlers).toEqual([newHandler]);
  });
});

describe('defaultSharedWinstonLoggerOptions', () => {
  it('is exported as the result of calling createSharedWinstonLoggerOptions() with no args', () => {
    expect(defaultSharedWinstonLoggerOptions).toBeDefined();
    expect(defaultSharedWinstonLoggerOptions.level).toBe('info');
  });
});
