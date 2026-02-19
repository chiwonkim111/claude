/**
 * 체크인 리포지토리 인터페이스 (도메인 레이어)
 */
import { CheckinSession } from './checkin-session.entity'
import { CheckinQuestion } from './checkin-question.entity'

export const CHECKIN_REPOSITORY = Symbol('CHECKIN_REPOSITORY')

export interface CheckinRepository {
  /** 사용자의 모든 체크인 세션 조회 */
  findSessionsByUserId(userId: number): Promise<CheckinSession[]>

  /** 세션 ID로 체크인 세션 조회 */
  findSessionById(id: number): Promise<CheckinSession | null>

  /** 특정 분기/연도 체크인 세션 조회 (중복 방지용) */
  findSessionByQuarter(userId: number, quarter: string, year: number): Promise<CheckinSession | null>

  /** 체크인 세션 저장 */
  saveSession(session: Partial<CheckinSession>): Promise<CheckinSession>

  /** 세션에 속한 질문 목록 조회 */
  findQuestionsBySessionId(sessionId: number): Promise<CheckinQuestion[]>

  /** 질문 ID로 단일 질문 조회 */
  findQuestionById(id: number): Promise<CheckinQuestion | null>

  /** 질문 일괄 저장 (AI 생성 후) */
  saveQuestions(questions: Partial<CheckinQuestion>[]): Promise<CheckinQuestion[]>

  /** 질문 답변 업데이트 */
  updateAnswer(questionId: number, answerText: string): Promise<CheckinQuestion>
}
