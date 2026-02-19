/**
 * 체크인 질문 & 답변 도메인 엔티티
 * - AI(Claude)가 생성한 맞춤 질문과 사용자 답변 저장
 */
export class CheckinQuestion {
  id: number
  checkinSessionId: number
  questionText: string
  questionOrder: number
  answerText: string | null
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<CheckinQuestion>) {
    Object.assign(this, partial)
  }

  /** 답변 완료 여부 확인 */
  isAnswered(): boolean {
    return this.answerText !== null && this.answerText.trim().length > 0
  }
}
