/**
 * 성과 리포지토리 인터페이스 (도메인 레이어)
 */
import { Achievement } from './achievement.entity'

export const ACHIEVEMENT_REPOSITORY = Symbol('ACHIEVEMENT_REPOSITORY')

export interface AchievementRepository {
  /** 사용자 성과 목록 조회 (소프트 삭제 제외) */
  findByUserId(userId: number): Promise<Achievement[]>

  /** ID로 성과 조회 */
  findById(id: number): Promise<Achievement | null>

  /** 성과 저장 */
  save(achievement: Partial<Achievement>): Promise<Achievement>

  /** 성과 소프트 삭제 */
  softDelete(id: number): Promise<void>

  /** 인증 카운트 증가 */
  incrementVerificationCount(id: number): Promise<void>
}
