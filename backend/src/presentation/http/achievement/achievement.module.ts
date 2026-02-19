/**
 * 성과 항목 모듈
 */
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AchievementController } from './achievement.controller'
import { AchievementTypeOrmRepository } from '../../../infrastructure/database/repositories/achievement.typeorm-repository'
import { AchievementOrmEntity } from '../../../infrastructure/database/typeorm/entities/achievement.orm-entity'
import { ACHIEVEMENT_REPOSITORY } from '../../../domain/achievement/achievement.repository'

@Module({
  imports: [TypeOrmModule.forFeature([AchievementOrmEntity])],
  controllers: [AchievementController],
  providers: [
    { provide: ACHIEVEMENT_REPOSITORY, useClass: AchievementTypeOrmRepository },
  ],
  exports: [{ provide: ACHIEVEMENT_REPOSITORY, useClass: AchievementTypeOrmRepository }],
})
export class AchievementModule {}
