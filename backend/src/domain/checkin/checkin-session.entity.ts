/**
 * 분기별 체크인 세션 도메인 엔티티
 * - 사용자가 분기마다 수행하는 커리어 체크인 세션 관리
 */
export class CheckinSession {
  id: number
  userId: number
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  year: number
  status: 'draft' | 'in_progress' | 'completed' | 'skipped'
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<CheckinSession>) {
    Object.assign(this, partial)
  }

  /** 현재 분기 계산 (Q1~Q4) */
  static getCurrentQuarter(): { quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'; year: number } {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    let quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
    if (month <= 3) quarter = 'Q1'
    else if (month <= 6) quarter = 'Q2'
    else if (month <= 9) quarter = 'Q3'
    else quarter = 'Q4'

    return { quarter, year }
  }

  /** 체크인 완료 가능 여부 확인 */
  canComplete(): boolean {
    return this.status === 'in_progress'
  }
}
