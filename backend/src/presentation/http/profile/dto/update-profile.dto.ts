/**
 * 프로필 수정 요청 DTO
 */
import {
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  Min,
  Max,
  MaxLength,
} from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  jobCategory?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number

  @IsOptional()
  @IsString()
  @MaxLength(30)
  educationLevel?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  companyName?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  companyIndustry?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string

  @IsOptional()
  @IsBoolean()
  isJobSeeking?: boolean
}
