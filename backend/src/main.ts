/**
 * 애플리케이션 진입점
 * - NestJS 앱 인스턴스 생성 및 전역 설정 적용
 * - ValidationPipe, 전역 필터, 인터셉터를 등록
 */
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 전역 유효성 검사 파이프 — 요청 DTO 자동 검증
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // DTO에 없는 필드 자동 제거
      forbidNonWhitelisted: true, // 불필요한 필드 포함 시 400 반환
      transform: true,       // 요청 데이터 타입 자동 변환
    }),
  )

  // 전역 예외 필터 — 모든 예외를 표준 응답 형식으로 변환
  app.useGlobalFilters(new GlobalExceptionFilter())

  // 전역 응답 포맷 인터셉터 — { success: true, data: ... } 형식 통일
  app.useGlobalInterceptors(new ResponseFormatInterceptor())

  // CORS 설정 — 모바일 앱 및 웹 클라이언트 허용
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
    credentials: true,
  })

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`✅ Remember Profile Diary API 서버 실행 중: http://localhost:${port}`)
}

bootstrap()
