/**
 * 체크인 완료 유스케이스
 * - 답변 기반으로 성과 항목 자동 생성
 * - 완료 후 프로필 완성도 스코어 및 마켓 밸류 재계산 트리거
 */
import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common'
import { CheckinRepository, CHECKIN_REPOSITORY } from '../../domain/checkin/checkin.repository'
import { AchievementRepository, ACHIEVEMENT_REPOSITORY } from '../../domain/achievement/achievement.repository'
import { ProfileRepository, PROFILE_REPOSITORY } from '../../domain/profile/profile.repository'

export interface CompleteCheckinOutput {
  completedAt: Date
  completionScoreBefore: number
  completionScoreAfter: number
  achievementsCreated: number
}

@Injectable()
export class CompleteCheckinUseCase {
  constructor(
    @Inject(CHECKIN_REPOSITORY)
    private readonly checkinRepo: CheckinRepository,
    @Inject(ACHIEVEMENT_REPOSITORY)
    private readonly achievementRepo: AchievementRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepo: ProfileRepository,
  ) {}

  async execute(sessionId: number, userId: number): Promise<CompleteCheckinOutput> {
    // 1. 세션 존재 및 소유권 확인
    const session = await this.checkinRepo.findSessionById(sessionId)
    if (!session || session.userId !== userId) {
      throw new NotFoundException({
        code: 'CHECKIN_NOT_FOUND',
        message: '체크인 세션을 찾을 수 없습니다.',
      })
    }

    // 2. 완료 가능 상태 확인
    if (!session.canComplete()) {
      throw new BadRequestException({
        code: 'CHECKIN_CANNOT_COMPLETE',
        message: '진행 중인 체크인만 완료할 수 있습니다.',
      })
    }

    // 3. 완료된 답변 조회
    const questions = await this.checkinRepo.findQuestionsBySessionId(sessionId)
    const answeredQuestions = questions.filter((q) => q.isAnswered())

    // 4. 체크인 세션 완료 처리
    const completedAt = new Date()
    await this.checkinRepo.saveSession({
      ...session,
      status: 'completed',
      completedAt,
    })

    // 5. 답변에서 성과 항목 자동 생성 (답변이 있는 질문 기준)
    let achievementsCreated = 0
    if (answeredQuestions.length > 0) {
      // 체크인 기반 성과 자동 등록
      await this.achievementRepo.save({
        userId,
        checkinSessionId: sessionId,
        title: `${session.year}년 ${session.quarter} 체크인 성과`,
        description: answeredQuestions
          .map((q) => `Q: ${q.questionText}\nA: ${q.answerText}`)
          .join('\n\n'),
        source: 'checkin',
        verificationCount: 0,
        isVerified: false,
      })
      achievementsCreated = 1
    }

    // 6. 프로필 완성도 재계산
    const profile = await this.profileRepo.findByUserId(userId)
    const scoreBefore = profile?.completionScore ?? 0

    if (profile) {
      // 체크인 완료로 완성도 +15점 (최대 100점)
      const scoreAfter = Math.min(100, scoreBefore + 15)
      await this.profileRepo.updateCompletionScore(profile.id, scoreAfter)

      return {
        completedAt,
        completionScoreBefore: scoreBefore,
        completionScoreAfter: scoreAfter,
        achievementsCreated,
      }
    }

    return {
      completedAt,
      completionScoreBefore: scoreBefore,
      completionScoreAfter: scoreBefore,
      achievementsCreated,
    }
  }
}
