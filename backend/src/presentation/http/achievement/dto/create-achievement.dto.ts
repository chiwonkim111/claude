/**
 * 성과 수동 등록 요청 DTO
 */
import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator'

export class CreateAchievementDto {
  @IsString()
  @MinLength(2, { message: '성과 제목은 2자 이상이어야 합니다.' })
  @MaxLength(200)
  title: string

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  projectName?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metrics?: string

  @IsOptional()
  @IsDateString()
  periodStart?: string

  @IsOptional()
  @IsDateString()
  periodEnd?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsUsed?: string[]
}
