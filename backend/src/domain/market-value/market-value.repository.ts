/**
 * 마켓 밸류 리포지토리 인터페이스 (도메인 레이어)
 */
import { MarketValueSnapshot } from './market-value-snapshot.entity'

export const MARKET_VALUE_REPOSITORY = Symbol('MARKET_VALUE_REPOSITORY')

export interface MarketValueRepository {
  /** 사용자의 최신 마켓 밸류 스냅샷 조회 */
  findLatestByUserId(userId: number): Promise<MarketValueSnapshot | null>

  /** 사용자의 마켓 밸류 이력 조회 (최신순) */
  findHistoryByUserId(userId: number, limit?: number): Promise<MarketValueSnapshot[]>

  /** 마켓 밸류 스냅샷 저장 */
  save(snapshot: Partial<MarketValueSnapshot>): Promise<MarketValueSnapshot>

  /**
   * 동일 직무 카테고리의 연봉 통계 조회
   * - 마켓 밸류 계산을 위한 비교 데이터
   */
  findSalaryStatsByJobCategory(jobCategory: string): Promise<{
    sampleCount: number
    avgSalaryMin: number
    avgSalaryMax: number
  }>
}
