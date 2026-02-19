/**
 * 동료 인증 요청 DTO
 */
import { IsInt } from 'class-validator'

export class RequestVerificationDto {
  @IsInt()
  verifierUserId: number
}
