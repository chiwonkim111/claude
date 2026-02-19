/**
 * 체크인 모듈
 */
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CheckinController } from './checkin.controller'
import { CreateCheckinSessionUseCase } from '../../../application/checkin/create-checkin-session.use-case'
import { CompleteCheckinUseCase } from '../../../application/checkin/complete-checkin.use-case'
import { CheckinTypeOrmRepository } from '../../../infrastructure/database/repositories/checkin.typeorm-repository'
import { ProfileTypeOrmRepository } from '../../../infrastructure/database/repositories/profile.typeorm-repository'
import { AchievementTypeOrmRepository } from '../../../infrastructure/database/repositories/achievement.typeorm-repository'
import { ClaudeClient } from '../../../infrastructure/ai/claude.client'
import { CheckinSessionOrmEntity } from '../../../infrastructure/database/typeorm/entities/checkin-session.orm-entity'
import { CheckinQuestionOrmEntity } from '../../../infrastructure/database/typeorm/entities/checkin-question.orm-entity'
import { ProfileOrmEntity } from '../../../infrastructure/database/typeorm/entities/profile.orm-entity'
import { SkillOrmEntity } from '../../../infrastructure/database/typeorm/entities/skill.orm-entity'
import { AchievementOrmEntity } from '../../../infrastructure/database/typeorm/entities/achievement.orm-entity'
import { CHECKIN_REPOSITORY } from '../../../domain/checkin/checkin.repository'
import { PROFILE_REPOSITORY } from '../../../domain/profile/profile.repository'
import { ACHIEVEMENT_REPOSITORY } from '../../../domain/achievement/achievement.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CheckinSessionOrmEntity,
      CheckinQuestionOrmEntity,
      ProfileOrmEntity,
      SkillOrmEntity,
      AchievementOrmEntity,
    ]),
  ],
  controllers: [CheckinController],
  providers: [
    CreateCheckinSessionUseCase,
    CompleteCheckinUseCase,
    ClaudeClient,
    { provide: CHECKIN_REPOSITORY, useClass: CheckinTypeOrmRepository },
    { provide: PROFILE_REPOSITORY, useClass: ProfileTypeOrmRepository },
    { provide: ACHIEVEMENT_REPOSITORY, useClass: AchievementTypeOrmRepository },
  ],
})
export class CheckinModule {}
