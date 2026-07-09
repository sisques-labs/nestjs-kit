// ─── Metrics (Prometheus) ──────────────────────────────────────────────────────
// Separate entry point so importing '@sisques-labs/nestjs-kit' does not
// require the optional `@willsoto/nestjs-prometheus`, `prom-client`, and
// `@nestjs/graphql` peer dependencies. Import from
// '@sisques-labs/nestjs-kit/metrics' when you use Prometheus instrumentation.

export * from '../shared/metrics/domain/constants/metrics.constants';
export * from '../shared/metrics/domain/types/cqrs-kind.type';
export * from '../shared/metrics/domain/types/cqrs-status.type';
export * from '../shared/metrics/domain/types/transport.type';

export * from '../shared/metrics/application/services/cqrs-metrics.service';

export * from '../shared/metrics/infrastructure/providers/metric.providers';

export * from '../shared/metrics/transport/interceptors/http-metrics.interceptor';
export * from '../shared/metrics/transport/rest/controllers/metrics.controller';

export * from '../shared/metrics/metrics-module-options.interface';
export * from '../shared/metrics/metrics.module';
