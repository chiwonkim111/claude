/**
 * 알림 컨트롤러
 * - GET   /api/v1/notifications             — 알림 목록 조회
 * - POST  /api/v1/notifications/:id/read    — 알림 읽음 처리
 * - GET   /api/v1/notifications/settings    — 알림 설정 조회
 * - PATCH /api/v1/notifications/settings    — 알림 설정 수정
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
  Inject,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator'
import { NotificationRepository, NOTIFICATION_REPOSITORY } from '../../../domain/notification/notification.repository'
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto'

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: NotificationRepository,
  ) {}

  /** 알림 목록 조회 */
  @Get()
  async getNotifications(@CurrentUser() user: JwtPayload) {
    return this.notificationRepo.findLogsByUserId(user.sub)
  }

  /** 알림 읽음 처리 */
  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    await this.notificationRepo.markAsRead(id)
    return { message: '읽음 처리 완료' }
  }

  /** 알림 설정 조회 */
  @Get('settings')
  async getSettings(@CurrentUser() user: JwtPayload) {
    return this.notificationRepo.findSettingsByUserId(user.sub)
  }

  /** 알림 설정 수정 */
  @Patch('settings')
  async updateSettings(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    const existing = await this.notificationRepo.findSettingsByUserId(user.sub)
    return this.notificationRepo.saveSettings({
      ...existing,
      userId: user.sub,
      ...dto,
    })
  }
}
