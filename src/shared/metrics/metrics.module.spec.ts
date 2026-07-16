import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { register } from 'prom-client';

import { CqrsMetricsService } from './application/services/cqrs-metrics.service';
import { METRIC_PROVIDERS } from './infrastructure/providers/metric.providers';
import { MetricsModule } from './metrics.module';
import { HttpMetricsInterceptor } from './transport/interceptors/http-metrics.interceptor';
import { MetricsController } from './transport/rest/controllers/metrics.controller';

describe('MetricsModule.forRoot', () => {
  // `PrometheusModule.register` registers Node/process default metrics
  // (e.g. `process_cpu_user_seconds_total`) on prom-client's global
  // registry as a side effect. Calling `forRoot` more than once without
  // clearing that registry throws "metric already registered" — clear it
  // between tests so each `forRoot` call starts clean.
  afterEach(() => {
    register.clear();
  });

  it('has no static module identity of its own', () => {
    const dynamicModule = MetricsModule.forRoot({ appLabel: 'my-service' });

    expect(dynamicModule.module).toBe(MetricsModule);
  });

  it('imports CqrsModule', () => {
    const dynamicModule = MetricsModule.forRoot({ appLabel: 'my-service' });

    expect(dynamicModule.imports).toContain(CqrsModule);
  });

  it('imports PrometheusModule.register with the metrics controller and appLabel as defaultLabels.app', () => {
    const dynamicModule = MetricsModule.forRoot({ appLabel: 'my-service' });

    const prometheusImport = dynamicModule.imports?.find(
      (imp) => imp !== CqrsModule,
    ) as { providers?: Array<{ useValue?: unknown }> } | undefined;

    expect(prometheusImport).toBeDefined();
    const optionsProvider = prometheusImport?.providers?.find(
      (provider) =>
        provider.useValue !== undefined &&
        typeof provider.useValue === 'object',
    );
    expect(optionsProvider?.useValue).toMatchObject({
      controller: MetricsController,
      defaultMetrics: { enabled: true },
      defaultLabels: { app: 'my-service' },
    });
  });

  it('spreads METRIC_PROVIDERS, registers HttpMetricsInterceptor as APP_INTERCEPTOR, and provides CqrsMetricsService', () => {
    const dynamicModule = MetricsModule.forRoot({ appLabel: 'my-service' });

    for (const provider of METRIC_PROVIDERS) {
      expect(dynamicModule.providers).toContain(provider);
    }
    expect(dynamicModule.providers).toContainEqual({
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    });
    expect(dynamicModule.providers).toContain(CqrsMetricsService);
  });
});
