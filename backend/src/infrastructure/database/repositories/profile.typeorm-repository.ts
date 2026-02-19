/**
 * TypeORM 프로필 리포지토리 구현체
 */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Profile, ProfileSkill } from '../../../domain/profile/profile.entity'
import { ProfileRepository } from '../../../domain/profile/profile.repository'
import { ProfileOrmEntity } from '../typeorm/entities/profile.orm-entity'
import { SkillOrmEntity } from '../typeorm/entities/skill.orm-entity'

// profile_skills 조인 테이블 직접 접근을 위한 인터페이스
interface ProfileSkillRow {
  id: number
  profile_id: number
  skill_id: number
  proficiency_level: string
  created_at: Date
  skill_name: string
}

@Injectable()
export class ProfileTypeOrmRepository implements ProfileRepository {
  constructor(
    @InjectRepository(ProfileOrmEntity)
    private readonly profileRepo: Repository<ProfileOrmEntity>,
    @InjectRepository(SkillOrmEntity)
    private readonly skillRepo: Repository<SkillOrmEntity>,
  ) {}

  async findByUserId(userId: number): Promise<Profile | null> {
    const entity = await this.profileRepo.findOne({
      where: { userId },
      relations: ['skills'],
    })
    return entity ? this.toDomain(entity) : null
  }

  async save(profile: Partial<Profile>): Promise<Profile> {
    const entity = this.profileRepo.create({
      id: profile.id,
      userId: profile.userId,
      jobTitle: profile.jobTitle ?? null,
      jobCategory: profile.jobCategory ?? null,
      yearsOfExperience: profile.yearsOfExperience ?? 0,
      educationLevel: profile.educationLevel ?? null,
      companyName: profile.companyName ?? null,
      companyIndustry: profile.companyIndustry ?? null,
      bio: profile.bio ?? null,
      isJobSeeking: profile.isJobSeeking ?? false,
      completionScore: profile.completionScore ?? 0,
      marketValueMin: profile.marketValueMin ?? null,
      marketValueMax: profile.marketValueMax ?? null,
      hireProbability: profile.hireProbability ?? null,
      marketValueUpdatedAt: profile.marketValueUpdatedAt ?? null,
    })
    const saved = await this.profileRepo.save(entity)
    return this.toDomain(saved)
  }

  async addSkill(profileId: number, skillId: number, proficiencyLevel: string): Promise<ProfileSkill> {
    // 조인 테이블에 직접 INSERT
    await this.profileRepo.query(
      'INSERT INTO profile_skills (profile_id, skill_id, proficiency_level) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [profileId, skillId, proficiencyLevel],
    )

    const skill = await this.skillRepo.findOneOrFail({ where: { id: skillId } })

    return {
      id: 0,
      profileId,
      skillId,
      skillName: skill.name,
      proficiencyLevel: proficiencyLevel as ProfileSkill['proficiencyLevel'],
      createdAt: new Date(),
    }
  }

  async removeSkill(profileId: number, skillId: number): Promise<void> {
    await this.profileRepo.query(
      'DELETE FROM profile_skills WHERE profile_id = $1 AND skill_id = $2',
      [profileId, skillId],
    )
  }

  async updateCompletionScore(profileId: number, score: number): Promise<void> {
    await this.profileRepo.update(profileId, { completionScore: score })
  }

  /** ORM → 도메인 변환 */
  private toDomain(entity: ProfileOrmEntity): Profile {
    return new Profile({
      id: Number(entity.id),
      userId: Number(entity.userId),
      jobTitle: entity.jobTitle,
      jobCategory: entity.jobCategory,
      yearsOfExperience: entity.yearsOfExperience,
      educationLevel: entity.educationLevel,
      companyName: entity.companyName,
      companyIndustry: entity.companyIndustry,
      bio: entity.bio,
      isJobSeeking: entity.isJobSeeking,
      completionScore: entity.completionScore,
      marketValueMin: entity.marketValueMin,
      marketValueMax: entity.marketValueMax,
      hireProbability: entity.hireProbability ? Number(entity.hireProbability) : null,
      marketValueUpdatedAt: entity.marketValueUpdatedAt,
      skills: entity.skills?.map((s) => ({
        id: Number(s.id),
        profileId: Number(entity.id),
        skillId: Number(s.id),
        skillName: s.name,
        proficiencyLevel: 'intermediate',
        createdAt: s.createdAt,
      })),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })
  }
}
