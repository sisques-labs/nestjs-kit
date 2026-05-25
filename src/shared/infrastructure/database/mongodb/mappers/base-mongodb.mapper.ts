import { Injectable } from '@nestjs/common';

import { BaseDatabaseMapper } from '@/shared/infrastructure/database/mappers/base-database.mapper';
import { BaseMongoDto } from '@/shared/infrastructure/database/mongodb/dtos/base-mongo.dto';

/**
 * Base mapper for transforming between domain view models, MongoDB document DTOs, and aggregates.
 *
 * @typeParam TViewModel - The shape of the domain view model.
 * @typeParam TMongoDto - The MongoDB DTO shape, should extend {@link BaseMongoDto}.
 * @typeParam TAggregate - The aggregate root or domain entity.
 *
 * @remarks
 * Extend this class to define field-level mapping between MongoDB documents and domain/aggregate objects.
 * Implement mapping logic in the subclass by overriding the abstract methods.
 */
@Injectable()
export abstract class BaseMongoDBMapper<
  TViewModel,
  TMongoDto extends BaseMongoDto,
  TAggregate,
> extends BaseDatabaseMapper<TAggregate, TMongoDto> {
  /**
   * Maps a MongoDB document DTO to a domain view model.
   *
   * @param doc - The MongoDB DTO to convert.
   * @returns The mapped domain view model.
   */
  public abstract toViewModel(doc: TMongoDto): TViewModel;

  /**
   * Maps a domain view model to the MongoDB DTO format for persistence.
   *
   * @param viewModel - The domain view model to convert.
   * @returns The corresponding MongoDB DTO.
   */
  public abstract fromViewModelToMongoData(viewModel: TViewModel): TMongoDto;

  /**
   * Maps an aggregate root/entity to the MongoDB DTO format for persistence.
   *
   * @param aggregate - The aggregate or domain entity to convert.
   * @returns The corresponding MongoDB DTO.
   */
  public abstract fromAggregateToMongoData(aggregate: TAggregate): TMongoDto;

  /**
   * Converts a MongoDB document DTO to an aggregate root/entity.
   *
   * @param doc - The MongoDB DTO to convert.
   * @returns The constructed aggregate or domain entity.
   */
  public abstract toAggregate(doc: TMongoDto): TAggregate;

  /**
   * @inheritdoc
   */
  public toPersistence(aggregate: TAggregate): TMongoDto {
    return this.fromAggregateToMongoData(aggregate);
  }

  /**
   * Normalizes values that may be a {@link Date} instance or a date string into a {@link Date} object.
   *
   * @param value - The value to normalize, either a {@link Date} or an ISO8601 string.
   * @returns The normalized {@link Date} object.
   * @deprecated Use {@link normalizeDate} instead.
   */
  protected normalizeMongoDate(value: Date | string): Date {
    return this.normalizeDate(value);
  }
}
