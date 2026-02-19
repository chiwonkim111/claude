/**
 * 동료 인증 도메인 엔티티
 * - 성과 항목에 대한 동료 상호 인증 요청/승인/거절 관리
 */
export class PeerVerification {
  id: number
  achievementId: number
  requesterId: number
  verifierId: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  requestedAt: Date
  respondedAt: Date | null
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<PeerVerification>) {
    Object.assign(this, partial)
  }

  /** 응답 가능 여부 확인 (pending 상태일 때만) */
  canRespond(): boolean {
    return this.status === 'pending'
  }

  /** 취소 가능 여부 확인 (요청자가 pending 상태일 때만) */
  canCancel(): boolean {
    return this.status === 'pending'
  }
}
