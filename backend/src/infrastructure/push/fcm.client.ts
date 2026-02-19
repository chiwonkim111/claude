/**
 * FCM (Firebase Cloud Messaging) 푸시 알림 클라이언트
 * - iOS/Android 모바일 앱 푸시 알림 발송
 */
import { Injectable, Logger } from '@nestjs/common'

export interface FcmMessage {
  token: string           // 디바이스 FCM 토큰
  title: string           // 알림 제목
  body: string            // 알림 본문
  data?: Record<string, string>  // 추가 데이터 (딥링크 등)
}

@Injectable()
export class FcmClient {
  private readonly logger = new Logger(FcmClient.name)
  private readonly serverKey = process.env.FCM_SERVER_KEY

  /**
   * 단일 디바이스에 푸시 알림 발송
   */
  async sendPush(message: FcmMessage): Promise<boolean> {
    if (!this.serverKey) {
      this.logger.warn('FCM_SERVER_KEY 미설정 — 알림 발송 건너뜀')
      return false
    }

    try {
      const payload = {
        to: message.token,
        notification: {
          title: message.title,
          body: message.body,
        },
        data: message.data ?? {},
      }

      // FCM HTTP v1 API 호출
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${this.serverKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`FCM 응답 오류: ${response.status}`)
      }

      this.logger.log(`푸시 알림 발송 성공: ${message.title}`)
      return true
    } catch (error) {
      this.logger.error('푸시 알림 발송 실패', error)
      return false
    }
  }

  /**
   * 다수 디바이스에 일괄 푸시 알림 발송
   */
  async sendMulticast(tokens: string[], title: string, body: string): Promise<void> {
    const sendPromises = tokens.map((token) =>
      this.sendPush({ token, title, body }),
    )
    await Promise.allSettled(sendPromises)
  }
}
