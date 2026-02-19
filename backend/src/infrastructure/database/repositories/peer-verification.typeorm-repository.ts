/**
 * TypeORM 동료 인증 리포지토리 구현체
 */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PeerVerification } from '../../../domain/peer-verification/peer-verification.entity'
import { PeerVerificationRepository } from '../../../domain/peer-verification/peer-verification.repository'
import { PeerVerificationOrmEntity } from '../typeorm/entities/peer-verification.orm-entity'

@Injectable()
export class PeerVerificationTypeOrmRepository implements PeerVerificationRepository {
  constructor(
    @InjectRepository(PeerVerificationOrmEntity)
    private readonly repo: Repository<PeerVerificationOrmEntity>,
  ) {}

  async findByAchievementId(achievementId: number): Promise<PeerVerification[]> {
    const entities = await this.repo.find({ where: { achievementId } })
    return entities.map(this.toDomain)
  }

  async findByVerifierId(verifierId: number): Promise<PeerVerification[]> {
    const entities = await this.repo.find({
      where: { verifierId },
      order: { createdAt: 'DESC' },
    })
    return entities.map(this.toDomain)
  }

  async findByAchievementAndVerifier(achievementId: number, verifierId: number): Promise<PeerVerification | null> {
    const entity = await this.repo.findOne({ where: { achievementId, verifierId } })
    return entity ? this.toDomain(entity) : null
  }

  async findById(id: number): Promise<PeerVerification | null> {
    const entity = await this.repo.findOne({ where: { id } })
    return entity ? this.toDomain(entity) : null
  }

  async save(verification: Partial<PeerVerification>): Promise<PeerVerification> {
    const entity = this.repo.create({
      achievementId: verification.achievementId,
      requesterId: verification.requesterId,
      verifierId: verification.verifierId,
      status: verification.status ?? 'pending',
      requestedAt: verification.requestedAt ?? new Date(),
      respondedAt: verification.respondedAt ?? null,
    })
    const saved = await this.repo.save(entity)
    return this.toDomain(saved)
  }

  async updateStatus(id: number, status: PeerVerification['status'], respondedAt?: Date): Promise<void> {
    await this.repo.update(id, {
      status,
      respondedAt: respondedAt ?? null,
      updatedAt: new Date(),
    })
  }

  private toDomain(entity: PeerVerificationOrmEntity): PeerVerification {
    return new PeerVerification({
      id: Number(entity.id),
      achievementId: Number(entity.achievementId),
      requesterId: Number(entity.requesterId),
      verifierId: Number(entity.verifierId),
      status: entity.status,
      requestedAt: entity.requestedAt,
      respondedAt: entity.respondedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })
  }
}
