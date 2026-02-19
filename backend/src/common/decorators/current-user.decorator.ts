/**
 * 현재 인증된 사용자 정보 추출 데코레이터
 * - JWT 가드가 적용된 컨트롤러에서 사용
 * - @CurrentUser() user: JwtPayload 형태로 사용
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface JwtPayload {
  sub: number       // 사용자 ID
  email: string     // 이메일
  iat?: number      // 발급 시간
  exp?: number      // 만료 시간
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as JwtPayload
  },
)
