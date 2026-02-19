/**
 * 분기 체크인 세션 생성 유스케이스
 * - 현재 분기 체크인 중복 생성 방지 (409 반환)
 * - 세션 생성 후 Claude API로 맞춤 질문 비동기 생성
 */
import { Injectable, ConflictException, Inject } from '@nestjs/common'
import { CheckinRepository, CHECKIN_REPOSITORY } from '../../domain/checkin/checkin.repository'
import { ProfileRepository, PROFILE_REPOSITORY } from '../../domain/profile/profile.repository'
import { CheckinSession } from '../../domain/checkin/checkin-session.entity'
import { CheckinQuestion } from '../../domain/checkin/checkin-question.entity'
import { ClaudeClient } from '../../infrastructure/ai/claude.client'

export interface CreateCheckinOutput {
  sessionId: number
  quarter: string
  year: number
  status: string
  questions: Array<{ id: number; order: number; text: string }>
}

@Injectable()
export class CreateCheckinSessionUseCase {
  constructor(
    @Inject(CHECKIN_REPOSITORY)
    private readonly checkinRepo: CheckinRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepo: ProfileRepository,
    private readonly claudeClient: ClaudeClient,
  ) {}

  async execute(userId: number): Promise<CreateCheckinOutput> {
    // 1. 현재 분기 계산
    const { quarter, year } = CheckinSession.getCurrentQuarter()

    // 2. 동일 분기 중복 생성 방지
    const existing = await this.checkinRepo.findSessionByQuarter(userId, quarter, year)
    if (existing) {
      throw new ConflictException({
        code: 'CHECKIN_ALREADY_EXISTS',
        message: `${year}년 ${quarter} 체크인이 이미 존재합니다.`,
      })
    }

    // 3. 체크인 세션 생성
    const session = await this.checkinRepo.saveSession({
      userId,
      quarter,
      year,
      status: 'in_progress',
      startedAt: new Date(),
    })

    // 4. 사용자 프로필 조회 (Claude 프롬프트용)
    const profile = await this.profileRepo.findByUserId(userId)

    // 5. Claude API로 맞춤 질문 5개 생성
    const questionTexts = await this.claudeClient.generateCheckinQuestions({
      jobTitle: profile?.jobTitle ?? null,
      jobCategory: profile?.jobCategory ?? null,
      yearsOfExperience: profile?.yearsOfExperience ?? 0,
      quarter,
      year,
    })

    // 6. 질문 DB 저장
    const questions = await this.checkinRepo.saveQuestions(
      questionTexts.map((text, index) => ({
        checkinSessionId: session.id,
        questionText: text,
        questionOrder: index + 1,
        answerText: null,
      })),
    )

    return {
      sessionId: session.id,
      quarter: session.quarter,
      year: session.year,
      status: session.status,
      questions: questions.map((q: CheckinQuestion) => ({
        id: q.id,
        order: q.questionOrder,
        text: q.questionText,
      })),
    }
  }
}
