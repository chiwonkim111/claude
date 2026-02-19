/**
 * 알림 발송 이력 도메인 엔티티
 * - FCM을 통해 발송된 모든 알림의 이력 및 읽음 상태 관리
 */
export class NotificationLog {
  id: number
  userId: number
  type: 'checkin_reminder' | 'market_alert' | 'peer_request' | 'career_mission'
  title: string
  body: string
  sentAt: Date
  isRead: boolean
  readAt: Date | null
  createdAt: Date

  constructor(partial: Partial<NotificationLog>) {
    Object.assign(this, partial)
  }
}
