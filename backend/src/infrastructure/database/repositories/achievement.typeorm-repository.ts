/**
 * TypeORM 성과 리포지토리 구현체
 * - 소프트 삭제(deleted_at)를 TypeORM withDeleted/softDelete로 처리
 */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Achievement } from '../../../domain/achievement/achievement.entity'
import { AchievementRepository } from '../../../domain/achievement/achievement.repository'
import { AchievementOrmEntity } from '../typeorm/entities/achievement.orm-entity'

@Injectable()
export class AchievementTypeOrmRepository implements AchievementRepository {
  constructor(
    @InjectRepository(AchievementOrmEntity)
    private readonly repo: Repository<AchievementOrmEntity>,
  ) {}

  async findByUserId(userId: number): Promise<Achievement[]> {
    // 소프트 삭제된 항목 자동 제외 (TypeORM 기본 동작)
    const entities = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })
    return entities.map(this.toDomain)
  }

  async findById(id: number): Promise<Achievement | null> {
    const entity = await this.repo.findOne({ where: { id } })
    return entity ? this.toDomain(entity) : null
  }

  async save(achievement: Partial<Achievement>): Promise<Achievement> {
    const entity = this.repo.create({
      id: achievement.id,
      userId: achievement.userId,
      checkinSessionId: achievement.checkinSessionId ?? null,
      title: achievement.title,
      description: achievement.description ?? null,
      projectName: achievement.projectName ?? null,
      role: achievement.role ?? null,
      metrics: achievement.metrics ?? null,
      periodStart: achievement.periodStart ?? null,
      periodEnd: achievement.periodEnd ?? null,
      skillsUsed: achievement.skillsUsed ?? null,
      verificationCount: achievement.verificationCount ?? 0,
      isVerified: achievement.isVerified ?? false,
      source: achievement.source ?? 'manual',
    })
    const saved = await this.repo.save(entity)
    return this.toDomain(saved)
  }

  async softDelete(id: number): Promise<void> {
    await this.repo.softDelete(id)
  }

  async incrementVerificationCount(id: number): Promise<void> {
    await this.repo.increment({ id }, 'verificationCount', 1)
    // 인증 수 1 이상이면 is_verified true로 업데이트
    await this.repo.update(id, { isVerified: true })
  }

  /** ORM 엔티티 → 도메인 엔티티 변환 */
  private toDomain(entity: AchievementOrmEntity): Achievement {
    return new Achievement({
      id: Number(entity.id),
      userId: Number(entity.userId),
      checkinSessionId: entity.checkinSessionId ? Number(entity.checkinSessionId) : null,
      title: entity.title,
      description: entity.description,
      projectName: entity.projectName,
      role: entity.role,
      metrics: entity.metrics,
      periodStart: entity.periodStart,
      periodEnd: entity.periodEnd,
      skillsUsed: entity.skillsUsed,
      verificationCount: entity.verificationCount,
      isVerified: entity.isVerified,
      source: entity.source,
      deletedAt: entity.deletedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })
  }
}
