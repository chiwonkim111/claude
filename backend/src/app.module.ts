/**
 * 루트 애플리케이션 모듈
 * - 전체 모듈 구성 및 의존성 연결
 * - TypeORM, Redis, Bull Queue 전역 설정 포함
 */
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bull'
import { databaseConfig } from './config/database.config'
import { AuthModule } from './presentation/http/auth/auth.module'
import { ProfileModule } from './presentation/http/profile/profile.module'
import { CheckinModule } from './presentation/http/checkin/checkin.module'
import { AchievementModule } from './presentation/http/achievement/achievement.module'
import { MarketValueModule } from './presentation/http/market-value/market-value.module'
import { NotificationModule } from './presentation/http/notification/notification.module'
import { PeerVerificationModule } from './presentation/http/peer-verification/peer-verification.module'

@Module({
  imports: [
    // 데이터베이스 연결 설정
    TypeOrmModule.forRoot(databaseConfig),

    // Redis 기반 Bull 큐 전역 설정
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),

    // 기능 모듈 등록
    AuthModule,
    ProfileModule,
    CheckinModule,
    AchievementModule,
    MarketValueModule,
    NotificationModule,
    PeerVerificationModule,
  ],
})
export class AppModule {}
