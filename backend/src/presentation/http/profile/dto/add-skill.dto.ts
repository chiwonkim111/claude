/**
 * 스킬 추가 요청 DTO
 */
import { IsInt, IsString, IsIn } from 'class-validator'

export class AddSkillDto {
  @IsInt()
  skillId: number

  @IsString()
  @IsIn(['beginner', 'intermediate', 'advanced', 'expert'])
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}
