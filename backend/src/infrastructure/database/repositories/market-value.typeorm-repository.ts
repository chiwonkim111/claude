/**
 * TypeORM 마켓 밸류 리포지토리 구현체
 */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MarketValueSnapshot } from '../../../domain/market-value/market-value-snapshot.entity'
import { MarketValueRepository } from '../../../domain/market-value/market-value.repository'
import { MarketValueSnapshotOrmEntity } from '../typeorm/entities/market-value-snapshot.orm-entity'
import { ProfileOrmEntity } from '../typeorm/entities/profile.orm-entity'

@Injectable()
export class MarketValueTypeOrmRepository implements MarketValueRepository {
  constructor(
    @InjectRepository(MarketValueSnapshotOrmEntity)
    private readonly snapshotRepo: Repository<MarketValueSnapshotOrmEntity>,
    @InjectRepository(ProfileOrmEntity)
    private readonly profileRepo: Repository<ProfileOrmEntity>,
  ) {}

  async findLatestByUserId(userId: number): Promise<MarketValueSnapshot | null> {
    const entity = await this.snapshotRepo.findOne({
      where: { userId },
      order: { calculatedAt: 'DESC' },
    })
    return entity ? this.toDomain(entity) : null
  }

  async findHistoryByUserId(userId: number, limit = 8): Promise<MarketValueSnapshot[]> {
    const entities = await this.snapshotRepo.find({
      where: { userId },
      order: { calculatedAt: 'DESC' },
      take: limit,
    })
    return entities.map(this.toDomain)
  }

  async save(snapshot: Partial<MarketValueSnapshot>): Promise<MarketValueSnapshot> {
    const entity = this.snapshotRepo.create({
      userId: snapshot.userId,
      salaryMin: snapshot.salaryMin,
      salaryMax: snapshot.salaryMax,
      hireProbability: snapshot.hireProbability,
      sampleCount: snapshot.sampleCount,
      calculatedAt: snapshot.calculatedAt ?? new Date(),
    })
    const saved = await this.snapshotRepo.save(entity)
    return this.toDomain(saved)
  }

  async findSalaryStatsByJobCategory(jobCategory: string): Promise<{
    sampleCount: number
    avgSalaryMin: number
    avgSalaryMax: number
  }> {
    // 동일 직무 카테고리 프로필의 마켓 밸류 평균 집계
    const result = await this.profileRepo
      .createQueryBuilder('p')
      .select('COUNT(p.id)', 'sampleCount')
      .addSelect('AVG(p.market_value_min)', 'avgSalaryMin')
      .addSelect('AVG(p.market_value_max)', 'avgSalaryMax')
      .where('p.job_category = :jobCategory', { jobCategory })
      .andWhere('p.market_value_min IS NOT NULL')
      .getRawOne()

    return {
      sampleCount: Number(result?.sampleCount ?? 0),
      avgSalaryMin: Number(result?.avgSalaryMin ?? 5000),
      avgSalaryMax: Number(result?.avgSalaryMax ?? 7000),
    }
  }

  private toDomain(entity: MarketValueSnapshotOrmEntity): MarketValueSnapshot {
    return new MarketValueSnapshot({
      id: Number(entity.id),
      userId: Number(entity.userId),
      salaryMin: entity.salaryMin,
      salaryMax: entity.salaryMax,
      hireProbability: Number(entity.hireProbability),
      sampleCount: entity.sampleCount,
      calculatedAt: entity.calculatedAt,
      createdAt: entity.createdAt,
    })
  }
}
