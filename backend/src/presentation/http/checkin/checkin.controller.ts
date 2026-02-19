/**
 * 분기 체크인 컨트롤러
 * - GET    /api/v1/checkins             — 세션 목록 조회
 * - POST   /api/v1/checkins             — 세션 생성 + AI 질문 생성
 * - GET    /api/v1/checkins/:id         — 세션 상세 조회
 * - GET    /api/v1/checkins/:id/questions — 질문 목록 조회
 * - PATCH  /api/v1/checkins/:id/questions/:qId — 답변 저장
 * - POST   /api/v1/checkins/:id/complete — 체크인 완료
 */
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator'
import { SaveAnswerDto } from './dto/save-answer.dto'
import { CreateCheckinSessionUseCase } from '../../../application/checkin/create-checkin-session.use-case'
import { CompleteCheckinUseCase } from '../../../application/checkin/complete-checkin.use-case'
import { CheckinRepository, CHECKIN_REPOSITORY } from '../../../domain/checkin/checkin.repository'
import { Inject } from '@nestjs/common'

@Controller('api/v1/checkins')
@UseGuards(JwtAuthGuard)
export class CheckinController {
  constructor(
    private readonly createSessionUseCase: CreateCheckinSessionUseCase,
    private readonly completeCheckinUseCase: CompleteCheckinUseCase,
    @Inject(CHECKIN_REPOSITORY)
    private readonly checkinRepo: CheckinRepository,
  ) {}

  /** 체크인 세션 목록 조회 */
  @Get()
  async getSessions(@CurrentUser() user: JwtPayload) {
    return this.checkinRepo.findSessionsByUserId(user.sub)
  }

  /** 분기 체크인 세션 생성 + AI 질문 생성 */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSession(@CurrentUser() user: JwtPayload) {
    return this.createSessionUseCase.execute(user.sub)
  }

  /** 체크인 세션 상세 조회 */
  @Get(':id')
  async getSession(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() _user: JwtPayload,
  ) {
    return this.checkinRepo.findSessionById(id)
  }

  /** AI 생성 질문 목록 조회 */
  @Get(':id/questions')
  async getQuestions(@Param('id', ParseIntPipe) id: number) {
    return this.checkinRepo.findQuestionsBySessionId(id)
  }

  /** 질문 답변 저장 */
  @Patch(':id/questions/:qId')
  async saveAnswer(
    @Param('qId', ParseIntPipe) qId: number,
    @Body() dto: SaveAnswerDto,
  ) {
    return this.checkinRepo.updateAnswer(qId, dto.answerText)
  }

  /** 체크인 완료 처리 */
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async completeCheckin(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.completeCheckinUseCase.execute(id, user.sub)
  }
}
