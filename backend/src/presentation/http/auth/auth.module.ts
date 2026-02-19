/**
 * 인증 모듈
 * - JWT 전략 설정, 유스케이스 및 리포지토리 DI 등록
 */
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthController } from './auth.controller'
import { LoginUseCase } from '../../../application/auth/login.use-case'
import { RegisterUseCase } from '../../../application/auth/register.use-case'
import { UserTypeOrmRepository } from '../../../infrastructure/database/repositories/user.typeorm-repository'
import { ProfileTypeOrmRepository } from '../../../infrastructure/database/repositories/profile.typeorm-repository'
import { UserOrmEntity } from '../../../infrastructure/database/typeorm/entities/user.orm-entity'
import { ProfileOrmEntity } from '../../../infrastructure/database/typeorm/entities/profile.orm-entity'
import { SkillOrmEntity } from '../../../infrastructure/database/typeorm/entities/skill.orm-entity'
import { JwtStrategy } from './jwt.strategy'
import { USER_REPOSITORY } from '../../../domain/user/user.repository'
import { PROFILE_REPOSITORY } from '../../../domain/profile/profile.repository'
import { jwtConfig } from '../../../config/jwt.config'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConfig.access.secret,
      signOptions: { expiresIn: jwtConfig.access.expiresIn },
    }),
    TypeOrmModule.forFeature([UserOrmEntity, ProfileOrmEntity, SkillOrmEntity]),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    JwtStrategy,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
    { provide: PROFILE_REPOSITORY, useClass: ProfileTypeOrmRepository },
  ],
  exports: [JwtModule, { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository }],
})
export class AuthModule {}
