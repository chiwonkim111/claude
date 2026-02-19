/**
 * 응답 포맷 인터셉터
 * - 모든 성공 응답을 표준 형식으로 변환
 * - 형식: { success: true, data: ... }
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface StandardResponse<T> {
  success: boolean
  data: T
}

@Injectable()
export class ResponseFormatInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
      })),
    )
  }
}
