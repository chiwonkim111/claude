/**
 * 로그인 유스케이스
 * - 이메일/비밀번호 검증 후 JWT Access + Refresh Token 발급
 */
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Inject } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UserRepository, USER_REPOSITORY } from '../../domain/user/user.repository'
import { jwtConfig } from '../../config/jwt.config'

export interface LoginInput {
  email: string
  password: string
}

export interface LoginOutput {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    email: string
    name: string
  }
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // 1. 사용자 조회
    const user = await this.userRepo.findByEmail(input.email)
    if (!user || !user.isActive()) {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      })
    }

    // 2. 비밀번호 검증 (bcrypt)
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      })
    }

    // 3. JWT 토큰 발급
    const payload = { sub: user.id, email: user.email }

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConfig.access.secret,
      expiresIn: jwtConfig.access.expiresIn,
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConfig.refresh.secret,
      expiresIn: jwtConfig.refresh.expiresIn,
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  }
}
