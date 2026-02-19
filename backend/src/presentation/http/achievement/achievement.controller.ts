/**
 * 성과 항목 컨트롤러
 * - GET    /api/v1/achievements        — 타임라인 목록
 * - POST   /api/v1/achievements        — 성과 수동 등록
 * - GET    /api/v1/achievements/:id    — 성과 상세
 * - PATCH  /api/v1/achievements/:id    — 성과 수정
 * - DELETE /api/v1/achievements/:id    — 성과 소프트 삭제
 */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  Inject,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator'
import { CreateAchievementDto } from './dto/create-achievement.dto'
import { AchievementRepository, ACHIEVEMENT_REPOSITORY } from '../../../domain/achievement/achievement.repository'

@Controller('api/v1/achievements')
@UseGuards(JwtAuthGuard)
export class AchievementController {
  constructor(
    @Inject(ACHIEVEMENT_REPOSITORY)
    private readonly achievementRepo: AchievementRepository,
  ) {}

  /** 성과 타임라인 목록 조회 */
  @Get()
  async getAchievements(@CurrentUser() user: JwtPayload) {
    return this.achievementRepo.findByUserId(user.sub)
  }

  /** 성과 수동 등록 */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAchievement(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAchievementDto,
  ) {
    return this.achievementRepo.save({
      userId: user.sub,
      title: dto.title,
      description: dto.description ?? null,
      projectName: dto.projectName ?? null,
      role: dto.role ?? null,
      metrics: dto.metrics ?? null,
      periodStart: dto.periodStart ? new Date(dto.periodStart) : null,
      periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : null,
      skillsUsed: dto.skillsUsed ?? null,
      source: 'manual',
      verificationCount: 0,
      isVerified: false,
    })
  }

  /** 성과 상세 조회 */
  @Get(':id')
  async getAchievement(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const achievement = await this.achievementRepo.findById(id)
    if (!achievement || achievement.userId !== user.sub) {
      throw new NotFoundException({ code: 'ACHIEVEMENT_NOT_FOUND', message: '성과 항목을 찾을 수 없습니다.' })
    }
    return achievement
  }

  /** 성과 수정 */
  @Patch(':id')
  async updateAchievement(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAchievementDto,
  ) {
    const achievement = await this.achievementRepo.findById(id)
    if (!achievement || achievement.userId !== user.sub) {
      throw new NotFoundException({ code: 'ACHIEVEMENT_NOT_FOUND', message: '성과 항목을 찾을 수 없습니다.' })
    }
    return this.achievementRepo.save({ ...achievement, ...dto })
  }

  /** 성과 소프트 삭제 */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAchievement(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const achievement = await this.achievementRepo.findById(id)
    if (!achievement || achievement.userId !== user.sub) {
      throw new NotFoundException({ code: 'ACHIEVEMENT_NOT_FOUND', message: '성과 항목을 찾을 수 없습니다.' })
    }
    await this.achievementRepo.softDelete(id)
  }
}
