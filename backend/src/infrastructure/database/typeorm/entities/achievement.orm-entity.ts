/**
 * TypeORM 성과 항목 ORM 엔티티
 * - PostgreSQL achievements 테이블 매핑
 * - 소프트 삭제(deleted_at) 지원
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm'

@Entity('achievements')
@Index('idx_achievements_user_id', ['userId'])
@Index('idx_achievements_is_verified', ['isVerified'])
export class AchievementOrmEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number

  @Column({ name: 'checkin_session_id', type: 'bigint', nullable: true })
  checkinSessionId: number | null

  @Column({ type: 'varchar', length: 200 })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string | null

  @Column({ name: 'project_name', type: 'varchar', length: 100, nullable: true })
  projectName: string | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  role: string | null

  @Column({ type: 'text', nullable: true })
  metrics: string | null

  @Column({ name: 'period_start', type: 'date', nullable: true })
  periodStart: Date | null

  @Column({ name: 'period_end', type: 'date', nullable: true })
  periodEnd: Date | null

  @Column({ name: 'skills_used', type: 'json', nullable: true })
  skillsUsed: string[] | null

  @Column({ name: 'verification_count', type: 'int', default: 0 })
  verificationCount: number

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean

  @Column({ type: 'varchar', length: 20, default: 'manual' })
  source: 'manual' | 'checkin' | 'ai_log'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // TypeORM 소프트 삭제 — @DeleteDateColumn 사용
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null
}
