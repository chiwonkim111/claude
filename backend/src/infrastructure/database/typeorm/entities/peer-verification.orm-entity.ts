/**
 * TypeORM 동료 인증 ORM 엔티티
 * - PostgreSQL peer_verifications 테이블 매핑
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

@Entity('peer_verifications')
@Unique('uq_peer_verifications', ['achievementId', 'verifierId'])
@Index('idx_peer_verifications_achievement_id', ['achievementId'])
@Index('idx_peer_verifications_verifier_id', ['verifierId'])
export class PeerVerificationOrmEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'achievement_id', type: 'bigint' })
  achievementId: number

  @Column({ name: 'requester_id', type: 'bigint' })
  requesterId: number

  @Column({ name: 'verifier_id', type: 'bigint' })
  verifierId: number

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'

  @Column({ name: 'requested_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date

  @Column({ name: 'responded_at', type: 'timestamp', nullable: true })
  respondedAt: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
