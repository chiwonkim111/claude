/**
 * 커리어 프로필 도메인 엔티티
 * - 사용자의 직무 정보, 스킬, 마켓 밸류를 포함한 커리어 프로필
 */
export class ProfileSkill {
  id: number
  profileId: number
  skillId: number
  skillName?: string
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  createdAt: Date
}

export class Profile {
  id: number
  userId: number
  jobTitle: string | null
  jobCategory: string | null
  yearsOfExperience: number
  educationLevel: string | null
  companyName: string | null
  companyIndustry: string | null
  bio: string | null
  isJobSeeking: boolean
  completionScore: number
  marketValueMin: number | null
  marketValueMax: number | null
  hireProbability: number | null
  marketValueUpdatedAt: Date | null
  skills?: ProfileSkill[]
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<Profile>) {
    Object.assign(this, partial)
  }

  /**
   * 프로필 완성도 계산 (0~100)
   * - 필수 항목 충족 시 점수 부여
   */
  calculateCompletionScore(): number {
    let score = 0
    if (this.jobTitle) score += 20
    if (this.jobCategory) score += 10
    if (this.yearsOfExperience > 0) score += 10
    if (this.companyName) score += 15
    if (this.bio) score += 15
    if (this.skills && this.skills.length > 0) score += 20
    if (this.educationLevel) score += 10
    return score
  }
}
