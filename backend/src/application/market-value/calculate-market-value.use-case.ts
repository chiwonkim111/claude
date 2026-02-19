/**
 * 마켓 밸류 계산 유스케이스
 * - 동일 직무 카테고리 사용자 연봉 데이터 기반으로 연봉 범위 및 채용 확률 계산
 * - 계산 결과 Redis 캐싱 (1시간 TTL)
 * - 최소 샘플 10개 미만 시 422 반환
 */
import { Injectable, UnprocessableEntityException, Inject } from '@nestjs/common'
import { MarketValueRepository, MARKET_VALUE_REPOSITORY } from '../../domain/market-value/market-value.repository'
import { ProfileRepository, PROFILE_REPOSITORY } from '../../domain/profile/profile.repository'
import { RedisClient } from '../../infrastructure/cache/redis.client'

const MIN_SAMPLE_COUNT = 10   // 마켓 밸류 계산을 위한 최소 샘플 수
const CACHE_TTL_SECONDS = 3600  // 1시간 캐싱

export interface MarketValueOutput {
  salaryMin: number
  salaryMax: number
  hireProbability: number
  sampleCount: number
  updatedAt: Date
  positioning: {
    percentile: number
    strengths: string[]
    weaknesses: string[]
  }
}

@Injectable()
export class CalculateMarketValueUseCase {
  constructor(
    @Inject(MARKET_VALUE_REPOSITORY)
    private readonly marketValueRepo: MarketValueRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepo: ProfileRepository,
    private readonly redisClient: RedisClient,
  ) {}

  async execute(userId: number): Promise<MarketValueOutput> {
    const cacheKey = `market_value:${userId}`

    // 1. Redis 캐시에서 기존 결과 조회
    const cached = await this.redisClient.getJson<MarketValueOutput>(cacheKey)
    if (cached) return cached

    // 2. 사용자 프로필 조회
    const profile = await this.profileRepo.findByUserId(userId)
    if (!profile?.jobCategory) {
      throw new UnprocessableEntityException({
        code: 'MARKET_VALUE_INSUFFICIENT_DATA',
        message: '직무 카테고리를 먼저 입력해주세요.',
      })
    }

    // 3. 동일 직무 카테고리 연봉 통계 조회
    const stats = await this.marketValueRepo.findSalaryStatsByJobCategory(
      profile.jobCategory,
    )

    if (stats.sampleCount < MIN_SAMPLE_COUNT) {
      throw new UnprocessableEntityException({
        code: 'MARKET_VALUE_INSUFFICIENT_DATA',
        message: `동일 직무 샘플이 부족합니다. (현재 ${stats.sampleCount}개 / 최소 ${MIN_SAMPLE_COUNT}개 필요)`,
      })
    }

    // 4. 경력 연차 기반 연봉 보정 계산
    const experienceMultiplier = this.getExperienceMultiplier(profile.yearsOfExperience)
    const salaryMin = Math.round(stats.avgSalaryMin * experienceMultiplier)
    const salaryMax = Math.round(stats.avgSalaryMax * experienceMultiplier)

    // 5. 채용 확률 계산 (프로필 완성도 + 인증 여부 반영)
    const hireProbability = this.calculateHireProbability(profile.completionScore)

    // 6. 스냅샷 저장
    const calculatedAt = new Date()
    await this.marketValueRepo.save({
      userId,
      salaryMin,
      salaryMax,
      hireProbability,
      sampleCount: stats.sampleCount,
      calculatedAt,
    })

    // 7. 프로필 마켓 밸류 업데이트
    await this.profileRepo.save({
      ...profile,
      marketValueMin: salaryMin,
      marketValueMax: salaryMax,
      hireProbability,
      marketValueUpdatedAt: calculatedAt,
    })

    const result: MarketValueOutput = {
      salaryMin,
      salaryMax,
      hireProbability,
      sampleCount: stats.sampleCount,
      updatedAt: calculatedAt,
      positioning: {
        percentile: Math.round(hireProbability * 0.8),  // 단순화된 퍼센타일
        strengths: profile.skills?.slice(0, 2).map((s) => s.skillName ?? '') ?? [],
        weaknesses: [],
      },
    }

    // 8. Redis 캐싱 (1시간)
    await this.redisClient.setJson(cacheKey, result, CACHE_TTL_SECONDS)

    return result
  }

  /** 경력 연차에 따른 연봉 보정 계수 */
  private getExperienceMultiplier(years: number): number {
    if (years < 1) return 0.85
    if (years < 3) return 0.95
    if (years < 5) return 1.0
    if (years < 8) return 1.15
    if (years < 12) return 1.3
    return 1.45
  }

  /** 프로필 완성도 기반 채용 확률 계산 */
  private calculateHireProbability(completionScore: number): number {
    // 완성도 100% → 채용 확률 약 85%
    return Math.min(85, Math.round(completionScore * 0.85))
  }
}
