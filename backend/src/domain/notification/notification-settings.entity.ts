/**
 * 알림 설정 도메인 엔티티
 * - 사용자별 알림 수신 선호도 설정 (1:1 관계)
 */
export class NotificationSettings {
  id: number
  userId: number
  checkinReminderEnabled: boolean
  checkinReminderDaysBefore: number  // 분기 말 며칠 전 발송
  checkinReminderTime: string        // HH:MM 형식
  marketValueAlertEnabled: boolean
  peerRequestEnabled: boolean
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<NotificationSettings>) {
    Object.assign(this, partial)
  }
}
