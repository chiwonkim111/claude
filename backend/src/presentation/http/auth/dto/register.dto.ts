/**
 * 회원가입 요청 DTO
 */
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator'

export class RegisterDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string

  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  @MaxLength(100)
  password: string

  @IsString()
  @MinLength(2, { message: '이름은 2자 이상이어야 합니다.' })
  @MaxLength(50)
  name: string
}
