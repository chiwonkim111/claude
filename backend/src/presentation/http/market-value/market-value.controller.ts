/**
 * 마켓 밸류 컨트롤러
 * - GET  /api/v1/market-value           — 현재 마켓 밸류 조회
 * - POST /api/v1/market-value/calculate — 재계산 요청
 * - GET  /api/v1/market-value/history   — 변화 이력
 */
import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Inject,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator'
import { CalculateMarketValueUseCase } from '../../../application/market-value/calculate-market-value.use-case'
import { MarketValueRepository, MARKET_VALUE_REPOSITORY } from '../../../domain/market-value/market-value.repository'

@Controller('api/v1/market-value')
@UseGuards(JwtAuthGuard)
export class MarketValueController {
  constructor(
    private readonly calculateUseCase: CalculateMarketValueUseCase,
    @Inject(MARKET_VALUE_REPOSITORY)
    private readonly marketValueRepo: MarketValueRepository,
  ) {}

  /** 현재 마켓 밸류 조회 (캐시 우선) */
  @Get()
  async getMarketValue(@CurrentUser() user: JwtPayload) {
    return this.calculateUseCase.execute(user.sub)
  }

  /** 마켓 밸류 강제 재계산 */
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  async calculateMarketValue(@CurrentUser() user: JwtPayload) {
    return this.calculateUseCase.execute(user.sub)
  }

  /** 마켓 밸류 변화 이력 조회 (최근 4분기) */
  @Get('history')
  async getHistory(@CurrentUser() user: JwtPayload) {
    return this.marketValueRepo.findHistoryByUserId(user.sub, 4)
  }
}
