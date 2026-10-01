import { Criteria } from '@/shared/domain/entities/criteria';
import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';
import { SortDirection } from '@/shared/domain/enums/sort-direction.enum';
import { BaseDatabaseRepository } from '@/shared/infrastructure/database/base-database.repository';
import { MongoService } from '@/shared/infrastructure/database/mongodb/services/mongo.service';
import { Logger } from '@nestjs/common';
import { Collection } from 'mongodb';

/**
 * Base class for MongoDB repositories backed by {@link MongoService}.
 * Provides {@link getCollection}, query/sort builders, and paginated execution.
 */
export abstract class BaseMongoDatabaseRepository extends BaseDatabaseRepository {
  constructor(protected readonly mongoService: MongoService) {
    super();
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Returns a collection from the app database (same as {@link MongoService.getCollection}).
   */
  protected getCollection(collectionName: string): Collection {
    return this.mongoService.getCollection(collectionName);
  }

  /**
   * Builds a MongoDB query from a criteria
   *
   * @param criteria - The criteria to build the query from
   * @returns The MongoDB query
   */
  protected buildMongoQuery(criteria: Criteria): any {
    this.logger.log(
      `Building MongoDB query from criteria: ${JSON.stringify(criteria)}`,
    );
    const query: any = {};

    if (criteria.filters && criteria.filters.length > 0) {
      criteria.filters.forEach((filter) => {
        switch (filter.operator) {
          case FilterOperator.EQUALS:
            query[filter.field] = filter.value;
            break;
          case FilterOperator.NOT_EQUALS:
            query[filter.field] = { $ne: filter.value };
            break;
          case FilterOperator.LIKE:
            query[filter.field] = { $regex: filter.value, $options: 'i' };
            break;
          case FilterOperator.IN:
            query[filter.field] = {
              $in: Array.isArray(filter.value) ? filter.value : [filter.value],
            };
            break;
          case FilterOperator.GREATER_THAN:
            query[filter.field] = { $gt: filter.value };
            break;
          case FilterOperator.LESS_THAN:
            query[filter.field] = { $lt: filter.value };
            break;
          case FilterOperator.GREATER_THAN_OR_EQUAL:
            query[filter.field] = { $gte: filter.value };
            break;
          case FilterOperator.LESS_THAN_OR_EQUAL:
            query[filter.field] = { $lte: filter.value };
            break;
          case FilterOperator.IS_NULL:
            query[filter.field] = { $eq: null };
            break;
          case FilterOperator.IS_NOT_NULL:
            query[filter.field] = { $ne: null };
            break;
          default:
            break;
        }
      });
    }

    return query;
  }

  /**
   * Builds a MongoDB sort query from a criteria
   *
   * @param criteria - The criteria to build the sort query from
   * @returns The MongoDB sort query
   */
  protected buildSortQuery(criteria: Criteria): any {
    this.logger.log(
      `Building MongoDB sort query from criteria: ${JSON.stringify(criteria)}`,
    );
    if (!criteria.sorts || criteria.sorts.length === 0) {
      return { createdAt: SortDirection.DESC };
    }

    const sortQuery: any = {};
    criteria.sorts.forEach((sort) => {
      sortQuery[sort.field] = sort.direction === SortDirection.ASC ? 1 : -1;
    });

    return sortQuery;
  }

  /**
   * Executes a MongoDB query with pagination
   *
   * @param collection - The MongoDB collection to execute the query on
   * @param mongoQuery - The MongoDB query to execute
   * @param sortQuery - The MongoDB sort query to execute
   * @param skip - The number of documents to skip
   * @param limit - The number of documents to limit
   * @returns The data and total documents
   */
  protected async executeQueryWithPagination(
    collection: Collection,
    mongoQuery: any,
    sortQuery: any,
    skip: number,
    limit: number,
  ): Promise<[any[], number]> {
    this.logger.log(
      `Executing MongoDB query with pagination: ${JSON.stringify(mongoQuery)}`,
    );
    const [data, total] = await Promise.all([
      collection
        .find(mongoQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(mongoQuery),
    ]);

    return [data, total];
  }
}
