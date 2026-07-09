import { Controller, Get, Logger, Res } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { Response } from 'express';

/**
 * Public Prometheus scrape endpoint (`GET /metrics`, mounted under whatever
 * global prefix the app sets). Unauthenticated by default — access is
 * expected to be restricted at the network layer. Add an auth guard here (or
 * subclass) once the app has one.
 */
@Controller()
export class MetricsController extends PrometheusController {
  private readonly logger = new Logger(MetricsController.name);

  @Get()
  index(@Res({ passthrough: true }) response: Response): Promise<string> {
    this.logger.debug('Metrics scrape requested');
    return super.index(response);
  }
}
