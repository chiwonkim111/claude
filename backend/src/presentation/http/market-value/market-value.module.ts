/**
 * 마켓 밸류 모듈
 */
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MarketValueController } from './market-value.controller'
import { CalculateMarketValueUseCase } from '../../../application/market-value/calculate-market-value.use-case'
import { MarketValueSnapshotOrmEntity } from '../../../infrastructure/database/typeorm/entities/market-value-snapshot.orm-entity'
import { ProfileOrmEntity } from '../../../infrastructure/database/typeorm/entities/profile.orm-entity'
import { SkillOrmEntity } from '../../../infrastructure/database/typeorm/entities/skill.orm-entity'
import { MarketValueTypeOrmRepository } from '../../../infrastructure/database/repositories/market-value.typeorm-repository'
import { ProfileTypeOrmRepository } from '../../../infrastructure/database/repositories/profile.typeorm-repository'
import { RedisClient } from '../../../infrastructure/cache/redis.client'
import { MARKET_VALUE_REPOSITORY } from '../../../domain/market-value/market-value.repository'
import { PROFILE_REPOSITORY } from '../../../domain/profile/profile.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketValueSnapshotOrmEntity, ProfileOrmEntity, SkillOrmEntity]),
  ],
  controllers: [MarketValueController],
  providers: [
    CalculateMarketValueUseCase,
    RedisClient,
    { provide: MARKET_VALUE_REPOSITORY, useClass: MarketValueTypeOrmRepository },
    { provide: PROFILE_REPOSITORY, useClass: ProfileTypeOrmRepository },
  ],
})
export class MarketValueModule {}
