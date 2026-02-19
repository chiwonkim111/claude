/**
 * 동료 인증 컨트롤러
 * - POST   /api/v1/achievements/:id/verifications — 인증 요청 발송
 * - GET    /api/v1/verifications/received         — 받은 요청 목록
 * - POST   /api/v1/verifications/:id/approve      — 인증 승인
 * - POST   /api/v1/verifications/:id/reject       — 인증 거절
 * - DELETE /api/v1/verifications/:id              — 인증 요청 취소
 */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator'
import { RequestVerificationDto } from './dto/request-verification.dto'
import { RequestVerificationUseCase } from '../../../application/peer-verification/request-verification.use-case'
import { PeerVerificationRepository, PEER_VERIFICATION_REPOSITORY } from '../../../domain/peer-verification/peer-verification.repository'

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class PeerVerificationController {
  constructor(
    private readonly requestVerificationUseCase: RequestVerificationUseCase,
    @Inject(PEER_VERIFICATION_REPOSITORY)
    private readonly verificationRepo: PeerVerificationRepository,
  ) {}

  /** 동료 인증 요청 발송 */
  @Post('achievements/:id/verifications')
  @HttpCode(HttpStatus.CREATED)
  async requestVerification(
    @Param('id', ParseIntPipe) achievementId: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RequestVerificationDto,
  ) {
    return this.requestVerificationUseCase.execute({
      achievementId,
      requesterId: user.sub,
      verifierUserId: dto.verifierUserId,
    })
  }

  /** 받은 인증 요청 목록 조회 */
  @Get('verifications/received')
  async getReceivedVerifications(@CurrentUser() user: JwtPayload) {
    return this.verificationRepo.findByVerifierId(user.sub)
  }

  /** 인증 승인 */
  @Post('verifications/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveVerification(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const verification = await this.verificationRepo.findById(id)
    if (!verification || verification.verifierId !== user.sub) {
      throw new NotFoundException({ code: 'VERIFICATION_NOT_FOUND', message: '인증 요청을 찾을 수 없습니다.' })
    }
    if (!verification.canRespond()) {
      throw new BadRequestException({ code: 'VERIFICATION_ALREADY_RESPONDED', message: '이미 처리된 인증 요청입니다.' })
    }
    await this.verificationRepo.updateStatus(id, 'approved', new Date())
    return { status: 'approved' }
  }

  /** 인증 거절 */
  @Post('verifications/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectVerification(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const verification = await this.verificationRepo.findById(id)
    if (!verification || verification.verifierId !== user.sub) {
      throw new NotFoundException({ code: 'VERIFICATION_NOT_FOUND', message: '인증 요청을 찾을 수 없습니다.' })
    }
    if (!verification.canRespond()) {
      throw new BadRequestException({ code: 'VERIFICATION_ALREADY_RESPONDED', message: '이미 처리된 인증 요청입니다.' })
    }
    await this.verificationRepo.updateStatus(id, 'rejected', new Date())
    return { status: 'rejected' }
  }

  /** 인증 요청 취소 */
  @Delete('verifications/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelVerification(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const verification = await this.verificationRepo.findById(id)
    if (!verification || verification.requesterId !== user.sub) {
      throw new NotFoundException({ code: 'VERIFICATION_NOT_FOUND', message: '인증 요청을 찾을 수 없습니다.' })
    }
    if (!verification.canCancel()) {
      throw new BadRequestException({ code: 'VERIFICATION_CANNOT_CANCEL', message: 'pending 상태에서만 취소할 수 있습니다.' })
    }
    await this.verificationRepo.updateStatus(id, 'cancelled')
  }
}
