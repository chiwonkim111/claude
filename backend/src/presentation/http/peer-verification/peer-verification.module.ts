/**
 * 동료 인증 모듈
 */
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PeerVerificationController } from './peer-verification.controller'
import { RequestVerificationUseCase } from '../../../application/peer-verification/request-verification.use-case'
import { PeerVerificationTypeOrmRepository } from '../../../infrastructure/database/repositories/peer-verification.typeorm-repository'
import { AchievementTypeOrmRepository } from '../../../infrastructure/database/repositories/achievement.typeorm-repository'
import { UserTypeOrmRepository } from '../../../infrastructure/database/repositories/user.typeorm-repository'
import { PeerVerificationOrmEntity } from '../../../infrastructure/database/typeorm/entities/peer-verification.orm-entity'
import { AchievementOrmEntity } from '../../../infrastructure/database/typeorm/entities/achievement.orm-entity'
import { UserOrmEntity } from '../../../infrastructure/database/typeorm/entities/user.orm-entity'
import { FcmClient } from '../../../infrastructure/push/fcm.client'
import { PEER_VERIFICATION_REPOSITORY } from '../../../domain/peer-verification/peer-verification.repository'
import { ACHIEVEMENT_REPOSITORY } from '../../../domain/achievement/achievement.repository'
import { USER_REPOSITORY } from '../../../domain/user/user.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([PeerVerificationOrmEntity, AchievementOrmEntity, UserOrmEntity]),
  ],
  controllers: [PeerVerificationController],
  providers: [
    RequestVerificationUseCase,
    FcmClient,
    { provide: PEER_VERIFICATION_REPOSITORY, useClass: PeerVerificationTypeOrmRepository },
    { provide: ACHIEVEMENT_REPOSITORY, useClass: AchievementTypeOrmRepository },
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
  ],
})
export class PeerVerificationModule {}
