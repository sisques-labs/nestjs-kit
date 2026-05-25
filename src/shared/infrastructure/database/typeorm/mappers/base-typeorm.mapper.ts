import { Injectable } from '@nestjs/common';

import { BaseDatabaseMapper } from '@/shared/infrastructure/database/mappers/base-database.mapper';
import { BaseTypeormEntity } from '@/shared/infrastructure/database/typeorm/entities/base-typeorm.entity';

/**
 * Base mapper for transforming between domain aggregates and TypeORM entities.
 *
 * @typeParam TAggregate - The aggregate root or domain entity.
 * @typeParam TEntity - The TypeORM entity shape, should extend {@link BaseTypeormEntity}.
 *
 * @remarks
 * Extend this class to define field-level mapping between TypeORM entities and domain aggregates.
 * Implement {@link toAggregate} and {@link toEntity} in the subclass.
 */
@Injectable()
export abstract class BaseTypeOrmMapper<
  TAggregate,
  TEntity extends BaseTypeormEntity,
> extends BaseDatabaseMapper<TAggregate, TEntity> {
  /**
   * Maps a TypeORM entity to a domain aggregate.
   *
   * @param entity - The TypeORM entity to convert.
   * @returns The mapped domain aggregate.
   */
  public abstract toAggregate(entity: TEntity): TAggregate;

  /**
   * Maps a domain aggregate to a TypeORM entity.
   *
   * @param aggregate - The aggregate to convert.
   * @returns The corresponding TypeORM entity.
   */
  public abstract toEntity(aggregate: TAggregate): TEntity;

  /**
   * @inheritdoc
   */
  public toPersistence(aggregate: TAggregate): TEntity {
    return this.toEntity(aggregate);
  }
}
