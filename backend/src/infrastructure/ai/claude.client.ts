/**
 * Claude API 클라이언트
 * - 체크인 맞춤 질문 생성을 위한 Anthropic Claude API 연동
 */
import { Injectable, Logger } from '@nestjs/common'
import Anthropic from '@anthropic-ai/sdk'

@Injectable()
export class ClaudeClient {
  private readonly client: Anthropic
  private readonly logger = new Logger(ClaudeClient.name)

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    })
  }

  /**
   * 커리어 프로필 기반 분기 체크인 질문 생성
   * @param context 사용자 커리어 컨텍스트 (직무, 경력, 이전 체크인 답변 등)
   * @param count 생성할 질문 수 (기본 5개)
   */
  async generateCheckinQuestions(
    context: {
      jobTitle: string | null
      jobCategory: string | null
      yearsOfExperience: number
      quarter: string
      year: number
      previousAnswers?: string[]
    },
    count = 5,
  ): Promise<string[]> {
    const prompt = this.buildQuestionPrompt(context, count)

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      // 응답에서 질문 목록 파싱
      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Claude 응답 형식 오류')
      }

      return this.parseQuestions(content.text, count)
    } catch (error) {
      this.logger.error('Claude API 질문 생성 실패', error)
      // API 실패 시 기본 질문 반환
      return this.getDefaultQuestions(count)
    }
  }

  /**
   * 분기 체크인 질문 생성 프롬프트 작성
   */
  private buildQuestionPrompt(
    context: {
      jobTitle: string | null
      jobCategory: string | null
      yearsOfExperience: number
      quarter: string
      year: number
      previousAnswers?: string[]
    },
    count: number,
  ): string {
    return `당신은 커리어 코치입니다. 다음 사용자의 ${context.year}년 ${context.quarter} 분기 커리어 체크인을 위한 맞춤형 질문 ${count}개를 생성해주세요.

사용자 정보:
- 직함: ${context.jobTitle ?? '미입력'}
- 직무 분야: ${context.jobCategory ?? '미입력'}
- 경력: ${context.yearsOfExperience}년

질문 작성 원칙:
1. 구체적인 성과와 임팩트를 이끌어내는 질문
2. 수치/데이터로 답변할 수 있는 질문 포함
3. 성장과 배움을 반영하는 질문
4. 한국어로 작성

응답 형식 (JSON 배열만 반환):
["질문1", "질문2", "질문3", "질문4", "질문5"]`
  }

  /**
   * Claude 응답 텍스트에서 질문 배열 파싱
   */
  private parseQuestions(text: string, count: number): string[] {
    try {
      // JSON 배열 추출 (텍스트에 다른 내용이 포함될 수 있음)
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('JSON 배열을 찾을 수 없음')

      const questions: string[] = JSON.parse(jsonMatch[0])
      return questions.slice(0, count)
    } catch {
      this.logger.warn('Claude 응답 파싱 실패, 기본 질문으로 대체')
      return this.getDefaultQuestions(count)
    }
  }

  /**
   * API 실패 시 사용할 기본 체크인 질문
   */
  private getDefaultQuestions(count: number): string[] {
    const defaults = [
      '이번 분기 가장 임팩트 있었던 프로젝트나 업무는 무엇인가요?',
      '이번 분기에 달성한 구체적인 성과(수치/지표)가 있다면 공유해주세요.',
      '이번 분기에 새롭게 배우거나 성장한 스킬은 무엇인가요?',
      '다음 분기에 가장 집중하고 싶은 커리어 목표는 무엇인가요?',
      '이번 분기 가장 어려웠던 점과 어떻게 극복했는지 알려주세요.',
    ]
    return defaults.slice(0, count)
  }
}
