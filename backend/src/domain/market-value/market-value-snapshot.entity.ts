/**
 * 마켓 밸류 스냅샷 도메인 엔티티
 * - 특정 시점에 계산된 연봉 범위 및 채용 확률 이력 관리
 */
export class MarketValueSnapshot {
  id: number
  userId: number
  salaryMin: number    // 만원 단위
  salaryMax: number    // 만원 단위
  hireProbability: number  // 0~100
  sampleCount: number  // 동일 직무 샘플 수
  calculatedAt: Date
  createdAt: Date

  constructor(partial: Partial<MarketValueSnapshot>) {
    Object.assign(this, partial)
  }
}
