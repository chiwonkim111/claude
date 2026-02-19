/**
 * 동료 인증 리포지토리 인터페이스 (도메인 레이어)
 */
import { PeerVerification } from './peer-verification.entity'

export const PEER_VERIFICATION_REPOSITORY = Symbol('PEER_VERIFICATION_REPOSITORY')

export interface PeerVerificationRepository {
  /** 성과 ID로 인증 요청 목록 조회 */
  findByAchievementId(achievementId: number): Promise<PeerVerification[]>

  /** 인증자 ID로 받은 인증 요청 목록 조회 */
  findByVerifierId(verifierId: number): Promise<PeerVerification[]>

  /** 중복 요청 확인 (동일 성과 + 동일 인증자) */
  findByAchievementAndVerifier(achievementId: number, verifierId: number): Promise<PeerVerification | null>

  /** ID로 인증 요청 조회 */
  findById(id: number): Promise<PeerVerification | null>

  /** 인증 요청 저장 */
  save(verification: Partial<PeerVerification>): Promise<PeerVerification>

  /** 인증 상태 업데이트 */
  updateStatus(id: number, status: PeerVerification['status'], respondedAt?: Date): Promise<void>
}
