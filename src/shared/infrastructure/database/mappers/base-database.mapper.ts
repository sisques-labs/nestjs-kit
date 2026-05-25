import { Injectable } from '@nestjs/common';

/**
 * Base mapper for transforming between domain aggregates and persistence shapes.
 *
 * @typeParam TAggregate - The aggregate root or domain entity.
 * @typeParam TPersistence - The persistence shape (TypeORM entity, MongoDB DTO, etc.).
 *
 * @remarks
 * Extend this class to define field-level mapping between persistence and domain objects.
 * Database-specific mappers (TypeORM, MongoDB) should extend this base and add transport-specific helpers.
 */
@Injectable()
export abstract class BaseDatabaseMapper<TAggregate, TPersistence> {
  /**
   * Maps a persistence record to a domain aggregate.
   *
   * @param persistence - The persistence record to convert.
   * @returns The mapped domain aggregate.
   */
  public abstract toAggregate(persistence: TPersistence): TAggregate;

  /**
   * Maps a domain aggregate to its persistence shape.
   *
   * @param aggregate - The aggregate to convert.
   * @returns The corresponding persistence record.
   */
  public abstract toPersistence(aggregate: TAggregate): TPersistence;

  /**
   * Normalizes values that may be a {@link Date} instance or a date string into a {@link Date} object.
   *
   * @param value - The value to normalize, either a {@link Date} or an ISO8601 string.
   * @returns The normalized {@link Date} object.
   */
  protected normalizeDate(value: Date | string): Date {
    return value instanceof Date ? value : new Date(value);
  }
}
