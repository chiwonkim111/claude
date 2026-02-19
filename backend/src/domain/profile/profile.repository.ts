/**
 * 프로필 리포지토리 인터페이스 (도메인 레이어)
 */
import { Profile, ProfileSkill } from './profile.entity'

export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY')

export interface ProfileRepository {
  /** userId로 프로필 조회 (스킬 포함) */
  findByUserId(userId: number): Promise<Profile | null>

  /** 프로필 저장 (생성/수정) */
  save(profile: Partial<Profile>): Promise<Profile>

  /** 스킬 추가 */
  addSkill(profileId: number, skillId: number, proficiencyLevel: string): Promise<ProfileSkill>

  /** 스킬 삭제 */
  removeSkill(profileId: number, skillId: number): Promise<void>

  /** 완성도 스코어 업데이트 */
  updateCompletionScore(profileId: number, score: number): Promise<void>
}
