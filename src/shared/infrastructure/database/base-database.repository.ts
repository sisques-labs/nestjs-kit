import { Criteria } from '@/shared/domain/entities/criteria';
import { Logger } from '@nestjs/common';

/**
 * Base repository for database access, providing utility methods such as pagination.
 *
 * @remarks
 * Extend this class to implement repository logic shared across various database sources.
 * A logger is included for consistent logging in subclasses.
 */
export class BaseDatabaseRepository {
  /**
   * Logger instance for repository-level logging.
   * Assign an appropriate context in subclass constructor.
   */
  protected logger: Logger;

  /**
   * Initializes the base database repository.
   *
   * @remarks
   * Subclasses should call `super()` and can assign a logger context.
   */
  constructor() {}

  /**
   * Calculates pagination parameters (page, limit, skip) from domain Criteria.
   *
   * @param criteria - The criteria containing pagination information.
   * @returns An object with the current page number, limit per page, and number of records to skip.
   *
   * @example
   * const { page, limit, skip } = await repo.calculatePagination(criteria);
   */
  async calculatePagination(criteria: Criteria): Promise<{
    page: number;
    limit: number;
    skip: number;
  }> {
    const page = criteria.pagination.page || 1;
    const limit = criteria.pagination.perPage || 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  /**
   * Builds a TypeORM order object from domain criteria sorts.
   *
   * @param criteria - The criteria containing sort definitions.
   * @returns A TypeORM-compatible order object (e.g. { createdAt: 'DESC' }).
   */
  protected buildTypeOrmOrder(
    criteria: Criteria,
  ): Record<string, 'ASC' | 'DESC'> {
    return criteria.sorts.reduce<Record<string, 'ASC' | 'DESC'>>(
      (acc, sort) => ({
        ...acc,
        [sort.field]: sort.direction,
      }),
      {},
    );
  }
}
