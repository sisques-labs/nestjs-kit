import * as MetricsEntrypoint from './metrics';

describe('entrypoints/metrics barrel', () => {
  it('re-exports metrics constants, services, providers, interceptor, controller and module', () => {
    expect(MetricsEntrypoint.HTTP_REQUEST_DURATION).toBeDefined();
    expect(MetricsEntrypoint.CQRS_HANDLER_DURATION).toBeDefined();
    expect(MetricsEntrypoint.CqrsMetricsService).toBeDefined();
    expect(MetricsEntrypoint.METRIC_PROVIDERS).toBeDefined();
    expect(Array.isArray(MetricsEntrypoint.METRIC_PROVIDERS)).toBe(true);
    expect(MetricsEntrypoint.HttpMetricsInterceptor).toBeDefined();
    expect(MetricsEntrypoint.MetricsController).toBeDefined();
    expect(MetricsEntrypoint.MetricsModule).toBeDefined();
  });
});
