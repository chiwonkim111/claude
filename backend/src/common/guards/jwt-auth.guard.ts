/**
 * JWT 인증 가드
 * - 보호된 엔드포인트에 적용하여 Access Token 유효성 검증
 * - Authorization: Bearer {token} 헤더 필수
 */
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
