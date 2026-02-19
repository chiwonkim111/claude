/**
 * 인증 컨트롤러
 * - POST /api/v1/auth/register — 회원가입
 * - POST /api/v1/auth/login   — 로그인
 * - POST /api/v1/auth/logout  — 로그아웃 (JWT 필요)
 */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common'
import { Response } from 'express'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { LoginUseCase } from '../../../application/auth/login.use-case'
import { RegisterUseCase } from '../../../application/auth/register.use-case'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator'

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  /** 회원가입 */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto)
  }

  /** 로그인 — Refresh Token을 HttpOnly Cookie로 설정 */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.loginUseCase.execute(dto)

    // Refresh Token을 HttpOnly Cookie에 저장 (모바일 앱 보안)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30일 (ms)
    })

    return {
      accessToken: result.accessToken,
      user: result.user,
    }
  }

  /** 로그아웃 — Refresh Token Cookie 삭제 */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() _user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refreshToken')
    return { message: '로그아웃 되었습니다.' }
  }
}
