/**
 * 체크인 리마인더 큐 프로세서
 * - Bull Queue로 분기별 체크인 알림을 비동기 처리
 * - 해당 분기 미체크인 사용자에게 FCM 푸시 알림 발송
 */
import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { FcmClient } from '../push/fcm.client'
import { NotificationSettingsOrmEntity } from '../database/typeorm/entities/notification-settings.orm-entity'
import { CheckinSessionOrmEntity } from '../database/typeorm/entities/checkin-session.orm-entity'

export const CHECKIN_REMINDER_QUEUE = 'checkin-reminder'

export interface CheckinReminderJobData {
  quarter: string   // e.g. "Q1"
  year: number
  title?: string
  body?: string
}

@Injectable()
@Processor(CHECKIN_REMINDER_QUEUE)
export class CheckinReminderJob {
  private readonly logger = new Logger(CheckinReminderJob.name)

  constructor(
    private readonly fcmClient: FcmClient,
    @InjectRepository(NotificationSettingsOrmEntity)
    private readonly settingsRepo: Repository<NotificationSettingsOrmEntity>,
    @InjectRepository(CheckinSessionOrmEntity)
    private readonly sessionRepo: Repository<CheckinSessionOrmEntity>,
  ) {}

  @Process('send-reminders')
  async handleSendReminders(job: Job<CheckinReminderJobData>): Promise<void> {
    const { quarter, year, title, body } = job.data
    this.logger.log(`체크인 리마인더 처리 시작: ${year}년 ${quarter}`)

    // 1. 해당 분기 이미 체크인한 userId 목록 조회
    const checkedInRows = await this.sessionRepo
      .createQueryBuilder('s')
      .select('s.userId', 'userId')
      .where('s.quarter = :quarter AND s.year = :year', { quarter, year })
      .getRawMany<{ userId: number }>()
    const checkedInIds = new Set(checkedInRows.map((r) => r.userId))

    // 2. checkinReminderEnabled = true 인 설정 조회 → 미체크인 사용자 필터링
    const settings = await this.settingsRepo.find({ where: { checkinReminderEnabled: true } })
    const targetSettings = settings.filter((s) => !checkedInIds.has(s.userId))

    if (targetSettings.length === 0) {
      this.logger.log('체크인 리마인더 발송 대상 없음')
      return
    }

    this.logger.log(`리마인더 발송 대상: ${targetSettings.length}명`)

    // 3. FCM 멀티캐스트 발송
    // NOTE: 실제 FCM 토큰은 UserOrmEntity에 fcmToken 컬럼 추가 후 조회 필요
    // 현재는 발송 대상 로그만 기록하고, 토큰이 있는 경우에만 발송
    const pushTitle = title ?? `${year}년 ${quarter} 체크인 알림`
    const pushBody = body ?? '이번 분기 성과를 기록하고 마켓 밸류를 업데이트하세요.'

    // 토큰 기반 발송 (미래 구현: UserOrmEntity.fcmToken 조회)
    const mockTokens: string[] = []  // 실제 환경에서는 DB에서 조회
    if (mockTokens.length > 0) {
      await this.fcmClient.sendMulticast(mockTokens, pushTitle, pushBody)
    }

    this.logger.log(`체크인 리마인더 처리 완료 (대상 ${targetSettings.length}명, 토큰 ${mockTokens.length}개 발송)`)
  }
}
