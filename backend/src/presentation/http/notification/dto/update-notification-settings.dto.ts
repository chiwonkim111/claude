/**
 * 알림 설정 수정 요청 DTO
 */
import { IsBoolean, IsInt, IsOptional, IsString, Min, Max, Matches } from 'class-validator'

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  checkinReminderEnabled?: boolean

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  checkinReminderDaysBefore?: number

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'HH:MM 형식으로 입력해주세요.' })
  checkinReminderTime?: string

  @IsOptional()
  @IsBoolean()
  marketValueAlertEnabled?: boolean

  @IsOptional()
  @IsBoolean()
  peerRequestEnabled?: boolean
}
