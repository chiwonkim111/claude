/**
 * 프로필 모듈
 */
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProfileController } from './profile.controller'
import { ProfileTypeOrmRepository } from '../../../infrastructure/database/repositories/profile.typeorm-repository'
import { ProfileOrmEntity } from '../../../infrastructure/database/typeorm/entities/profile.orm-entity'
import { SkillOrmEntity } from '../../../infrastructure/database/typeorm/entities/skill.orm-entity'
import { PROFILE_REPOSITORY } from '../../../domain/profile/profile.repository'

@Module({
  imports: [TypeOrmModule.forFeature([ProfileOrmEntity, SkillOrmEntity])],
  controllers: [ProfileController],
  providers: [
    { provide: PROFILE_REPOSITORY, useClass: ProfileTypeOrmRepository },
  ],
})
export class ProfileModule {}
