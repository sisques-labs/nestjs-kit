import {
  CQRS_EVENTS_PUBLISHED_TOTAL,
  CQRS_HANDLER_DURATION,
  CQRS_HANDLER_TOTAL,
  HTTP_REQUEST_DURATION,
  HTTP_REQUESTS_TOTAL,
} from '@/shared/metrics/domain/constants/metrics.constants';
import { METRIC_PROVIDERS } from '@/shared/metrics/infrastructure/providers/metric.providers';

describe('METRIC_PROVIDERS', () => {
  it('is defined and contains one provider per metric', () => {
    expect(METRIC_PROVIDERS).toBeDefined();
    expect(METRIC_PROVIDERS).toHaveLength(5);
  });

  it('provides a token derived from every declared metric name', () => {
    const provideTokens = METRIC_PROVIDERS.map(
      (provider) => (provider as { provide: string }).provide,
    );

    [
      HTTP_REQUEST_DURATION,
      HTTP_REQUESTS_TOTAL,
      CQRS_HANDLER_DURATION,
      CQRS_HANDLER_TOTAL,
      CQRS_EVENTS_PUBLISHED_TOTAL,
    ].forEach((metricName) => {
      expect(
        provideTokens.some((token) =>
          token.toLowerCase().includes(metricName.toLowerCase()),
        ),
      ).toBe(true);
    });
  });
});
