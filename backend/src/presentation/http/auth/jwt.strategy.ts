/**
 * JWT Passport 전략
 * - Authorization: Bearer {token} 헤더에서 토큰 추출 및 검증
 * - 검증 성공 시 JwtPayload를 request.user에 주입
 */
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from '../../../common/decorators/current-user.decorator'
import { jwtConfig } from '../../../config/jwt.config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.access.secret,
    })
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub) {
      throw new UnauthorizedException({
        code: 'AUTH_TOKEN_EXPIRED',
        message: '토큰이 만료되었습니다.',
      })
    }
    return payload
  }
}
