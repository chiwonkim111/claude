/**
 * 동료 인증 요청 유스케이스
 * - 본인 인증 요청 방지 (400)
 * - 동일 동료 중복 요청 방지 (409)
 * - 인증 요청 후 FCM 푸시 알림 발송
 */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common'
import { AchievementRepository, ACHIEVEMENT_REPOSITORY } from '../../domain/achievement/achievement.repository'
import { PeerVerificationRepository, PEER_VERIFICATION_REPOSITORY } from '../../domain/peer-verification/peer-verification.repository'
import { UserRepository, USER_REPOSITORY } from '../../domain/user/user.repository'
import { FcmClient } from '../../infrastructure/push/fcm.client'

export interface RequestVerificationInput {
  achievementId: number
  requesterId: number
  verifierUserId: number
}

export interface RequestVerificationOutput {
  verificationId: number
  status: string
  verifier: { id: number; name: string }
  requestedAt: Date
}

@Injectable()
export class RequestVerificationUseCase {
  constructor(
    @Inject(ACHIEVEMENT_REPOSITORY)
    private readonly achievementRepo: AchievementRepository,
    @Inject(PEER_VERIFICATION_REPOSITORY)
    private readonly verificationRepo: PeerVerificationRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
    private readonly fcmClient: FcmClient,
  ) {}

  async execute(input: RequestVerificationInput): Promise<RequestVerificationOutput> {
    // 1. 본인 인증 방지
    if (input.requesterId === input.verifierUserId) {
      throw new BadRequestException({
        code: 'VERIFICATION_SELF_REQUEST',
        message: '본인에게 인증을 요청할 수 없습니다.',
      })
    }

    // 2. 성과 존재 확인
    const achievement = await this.achievementRepo.findById(input.achievementId)
    if (!achievement || achievement.userId !== input.requesterId) {
      throw new NotFoundException({
        code: 'ACHIEVEMENT_NOT_FOUND',
        message: '성과 항목을 찾을 수 없습니다.',
      })
    }

    // 3. 인증자 존재 확인
    const verifier = await this.userRepo.findById(input.verifierUserId)
    if (!verifier || !verifier.isActive()) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '해당 사용자를 찾을 수 없습니다.',
      })
    }

    // 4. 중복 요청 방지
    const existing = await this.verificationRepo.findByAchievementAndVerifier(
      input.achievementId,
      input.verifierUserId,
    )
    if (existing) {
      throw new ConflictException({
        code: 'VERIFICATION_ALREADY_SENT',
        message: '이미 해당 동료에게 인증 요청을 보냈습니다.',
      })
    }

    // 5. 인증 요청 생성
    const requestedAt = new Date()
    const verification = await this.verificationRepo.save({
      achievementId: input.achievementId,
      requesterId: input.requesterId,
      verifierId: input.verifierUserId,
      status: 'pending',
      requestedAt,
    })

    // 6. FCM 푸시 알림 발송 (비동기, 실패해도 무시)
    const requester = await this.userRepo.findById(input.requesterId)
    this.fcmClient.sendPush({
      token: '', // 실제 구현 시 verifier의 FCM 토큰 조회 필요
      title: '동료 인증 요청',
      body: `${requester?.name ?? '동료'}님이 성과 인증을 요청했습니다.`,
      data: { achievementId: String(input.achievementId) },
    }).catch(() => {}) // 알림 실패는 무시

    return {
      verificationId: verification.id,
      status: verification.status,
      verifier: { id: verifier.id, name: verifier.name },
      requestedAt,
    }
  }
}
