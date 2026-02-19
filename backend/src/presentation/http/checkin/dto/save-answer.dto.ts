/**
 * 질문 답변 저장 요청 DTO
 */
import { IsString, MinLength, MaxLength } from 'class-validator'

export class SaveAnswerDto {
  @IsString()
  @MinLength(1, { message: '답변을 입력해주세요.' })
  @MaxLength(2000, { message: '답변은 2000자 이하로 작성해주세요.' })
  answerText: string
}
