/**
 * 전역 예외 필터
 * - 모든 예외를 표준 에러 응답 형식으로 변환
 * - 형식: { success: false, error: { code, message } }
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status: number
    let code: string
    let message: string

    if (exception instanceof HttpException) {
      // NestJS HTTP 예외 처리
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as Record<string, unknown>
        code = (res['code'] as string) ?? this.statusToCode(status)
        message = (res['message'] as string) ?? exception.message
      } else {
        code = this.statusToCode(status)
        message = exception.message
      }
    } else {
      // 예상치 못한 서버 오류
      status = HttpStatus.INTERNAL_SERVER_ERROR
      code = 'INTERNAL_SERVER_ERROR'
      message = '서버 내부 오류가 발생했습니다.'

      // 스택 트레이스 로깅 (개발 환경)
      this.logger.error(
        `[${request.method}] ${request.url} — ${String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      )
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
      },
    })
  }

  /**
   * HTTP 상태 코드를 에러 코드 문자열로 변환
   */
  private statusToCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
    }
    return codeMap[status] ?? 'UNKNOWN_ERROR'
  }
}
