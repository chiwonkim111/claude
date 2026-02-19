/**
 * TypeORM 알림 설정 ORM 엔티티
 * - PostgreSQL notification_settings 테이블 매핑
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm'

@Entity('notification_settings')
@Unique('uq_notification_settings_user_id', ['userId'])
export class NotificationSettingsOrmEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number

  @Column({ name: 'checkin_reminder_enabled', type: 'boolean', default: true })
  checkinReminderEnabled: boolean

  @Column({ name: 'checkin_reminder_days_before', type: 'int', default: 14 })
  checkinReminderDaysBefore: number

  @Column({ name: 'checkin_reminder_time', type: 'varchar', length: 5, default: '09:00' })
  checkinReminderTime: string

  @Column({ name: 'market_value_alert_enabled', type: 'boolean', default: true })
  marketValueAlertEnabled: boolean

  @Column({ name: 'peer_request_enabled', type: 'boolean', default: true })
  peerRequestEnabled: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
