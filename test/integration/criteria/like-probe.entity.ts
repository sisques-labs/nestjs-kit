import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Probe entity for the LIKE integration suite. Property names intentionally
 * differ from column names (`bornOn` -> `born_on`) to prove TypeORM rewrites
 * the property path inside `CAST(...)`.
 */
@Entity('like_probe')
export class LikeProbe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'born_on', type: 'date' })
  bornOn: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'external_id', type: 'uuid' })
  externalId: string;

  @Column({ type: 'text' })
  name: string;
}
