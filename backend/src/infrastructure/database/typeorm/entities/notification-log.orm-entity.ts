/**
 * TypeORM 알림 발송 이력 ORM 엔티티
 * - PostgreSQL notification_logs 테이블 매핑
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm'

@Entity('notification_logs')
@Index('idx_notification_logs_user_id_is_read', ['userId', 'isRead'])
export class NotificationLogOrmEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number

  @Column({ type: 'varchar', length: 50 })
  type: 'checkin_reminder' | 'market_alert' | 'peer_request' | 'career_mission'

  @Column({ type: 'varchar', length: 200 })
  title: string

  @Column({ type: 'text' })
  body: string

  @Column({ name: 'sent_at', type: 'timestamp' })
  sentAt: Date

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
