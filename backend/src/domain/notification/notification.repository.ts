/**
 * 알림 리포지토리 인터페이스 (도메인 레이어)
 */
import { NotificationLog } from './notification-log.entity'
import { NotificationSettings } from './notification-settings.entity'

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY')

export interface NotificationRepository {
  /** 사용자 알림 목록 조회 (최신순) */
  findLogsByUserId(userId: number): Promise<NotificationLog[]>

  /** 알림 로그 저장 */
  saveLog(log: Partial<NotificationLog>): Promise<NotificationLog>

  /** 알림 읽음 처리 */
  markAsRead(logId: number): Promise<void>

  /** 사용자 알림 설정 조회 */
  findSettingsByUserId(userId: number): Promise<NotificationSettings | null>

  /** 알림 설정 저장 (생성/수정) */
  saveSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings>
}
