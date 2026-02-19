/**
 * TypeORM 분기 체크인 세션 ORM 엔티티
 * - PostgreSQL checkin_sessions 테이블 매핑
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm'

@Entity('checkin_sessions')
@Unique('uq_checkin_sessions_user_quarter', ['userId', 'quarter', 'year'])
@Index('idx_checkin_sessions_user_id', ['userId'])
export class CheckinSessionOrmEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number

  @Column({ type: 'varchar', length: 2 })
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'

  @Column({ type: 'int' })
  year: number

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'in_progress' | 'completed' | 'skipped'

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date | null

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
