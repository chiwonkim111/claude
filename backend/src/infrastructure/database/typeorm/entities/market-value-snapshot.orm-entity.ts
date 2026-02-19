/**
 * TypeORM 마켓 밸류 스냅샷 ORM 엔티티
 * - PostgreSQL market_value_snapshots 테이블 매핑
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm'

@Entity('market_value_snapshots')
@Index('idx_market_value_snapshots_user_id_calculated_at', ['userId', 'calculatedAt'])
export class MarketValueSnapshotOrmEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number

  @Column({ name: 'salary_min', type: 'int' })
  salaryMin: number

  @Column({ name: 'salary_max', type: 'int' })
  salaryMax: number

  @Column({ name: 'hire_probability', type: 'decimal', precision: 5, scale: 2 })
  hireProbability: number

  @Column({ name: 'sample_count', type: 'int' })
  sampleCount: number

  @Column({ name: 'calculated_at', type: 'timestamp' })
  calculatedAt: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
