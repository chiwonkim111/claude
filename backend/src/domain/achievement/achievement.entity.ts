/**
 * 성과 항목 도메인 엔티티
 * - 사용자의 업무 성과를 기록하고 동료 인증을 받는 핵심 도메인
 */
export class Achievement {
  id: number
  userId: number
  checkinSessionId: number | null
  title: string
  description: string | null
  projectName: string | null
  role: string | null
  metrics: string | null
  periodStart: Date | null
  periodEnd: Date | null
  skillsUsed: string[] | null
  verificationCount: number
  isVerified: boolean
  source: 'manual' | 'checkin' | 'ai_log'
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<Achievement>) {
    Object.assign(this, partial)
  }

  /** 소프트 삭제 여부 확인 */
  isDeleted(): boolean {
    return this.deletedAt !== null
  }

  /** 인증 카운트 증가 및 인증 상태 업데이트 */
  incrementVerification(): void {
    this.verificationCount += 1
    if (this.verificationCount >= 1) {
      this.isVerified = true
    }
  }
}
