/**
 * 마켓 밸류 재계산 큐 프로세서
 * - Bull Queue로 마켓 밸류 배치 재계산을 비동기 처리
 * - 분기 체크인 완료 후 자동 트리거 (CompleteCheckinUseCase에서 enqueue)
 * - 실패 시 Bull 자동 재시도 (기본 3회)
 */
import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { Injectable, Logger } from '@nestjs/common'

import { CalculateMarketValueUseCase } from '../../application/market-value/calculate-market-value.use-case'

export const MARKET_VALUE_QUEUE = 'market-value'

export interface MarketValueJobData {
  userId: number
}

@Injectable()
@Processor(MARKET_VALUE_QUEUE)
export class MarketValueJob {
  private readonly logger = new Logger(MarketValueJob.name)

  constructor(
    private readonly calculateMarketValueUseCase: CalculateMarketValueUseCase,
  ) {}

  @Process('recalculate')
  async handleRecalculate(job: Job<MarketValueJobData>): Promise<void> {
    const { userId } = job.data
    this.logger.log(`마켓 밸류 재계산 시작: userId=${userId}`)

    try {
      await this.calculateMarketValueUseCase.execute(userId)
      this.logger.log(`마켓 밸류 재계산 완료: userId=${userId}`)
    } catch (error) {
      this.logger.error(`마켓 밸류 재계산 실패: userId=${userId}`, error)
      throw error  // Bull이 재시도하도록 에러 re-throw
    }
  }
}
