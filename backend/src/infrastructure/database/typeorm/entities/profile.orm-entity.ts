/**
 * TypeORM 커리어 프로필 ORM 엔티티
 * - PostgreSQL profiles 테이블 매핑
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
  Unique,
} from 'typeorm'
import { SkillOrmEntity } from './skill.orm-entity'

@Entity('profiles')
@Unique('uq_profiles_user_id', ['userId'])
@Index('idx_profiles_user_id', ['userId'])
@Index('idx_profiles_job_category', ['jobCategory'])
export class ProfileOrmEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number

  @Column({ name: 'job_title', type: 'varchar', length: 100, nullable: true })
  jobTitle: string | null

  @Column({ name: 'job_category', type: 'varchar', length: 50, nullable: true })
  jobCategory: string | null

  @Column({ name: 'years_of_experience', type: 'int', default: 0 })
  yearsOfExperience: number

  @Column({ name: 'education_level', type: 'varchar', length: 30, nullable: true })
  educationLevel: string | null

  @Column({ name: 'company_name', type: 'varchar', length: 100, nullable: true })
  companyName: string | null

  @Column({ name: 'company_industry', type: 'varchar', length: 50, nullable: true })
  companyIndustry: string | null

  @Column({ type: 'text', nullable: true })
  bio: string | null

  @Column({ name: 'is_job_seeking', type: 'boolean', default: false })
  isJobSeeking: boolean

  @Column({ name: 'completion_score', type: 'int', default: 0 })
  completionScore: number

  @Column({ name: 'market_value_min', type: 'int', nullable: true })
  marketValueMin: number | null

  @Column({ name: 'market_value_max', type: 'int', nullable: true })
  marketValueMax: number | null

  @Column({ name: 'hire_probability', type: 'decimal', precision: 5, scale: 2, nullable: true })
  hireProbability: number | null

  @Column({ name: 'market_value_updated_at', type: 'timestamp', nullable: true })
  marketValueUpdatedAt: Date | null

  @ManyToMany(() => SkillOrmEntity)
  @JoinTable({
    name: 'profile_skills',
    joinColumn: { name: 'profile_id' },
    inverseJoinColumn: { name: 'skill_id' },
  })
  skills: SkillOrmEntity[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
