/**
 * 프로필 컨트롤러
 * - GET    /api/v1/profile                  — 내 프로필 조회
 * - PATCH  /api/v1/profile                  — 프로필 수정
 * - GET    /api/v1/profile/completion-score — 완성도 스코어
 * - GET    /api/v1/profile/skills           — 스킬 목록
 * - POST   /api/v1/profile/skills           — 스킬 추가
 * - DELETE /api/v1/profile/skills/:skillId  — 스킬 삭제
 */
import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  Inject,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { AddSkillDto } from './dto/add-skill.dto'
import { ProfileRepository, PROFILE_REPOSITORY } from '../../../domain/profile/profile.repository'

@Controller('api/v1/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepo: ProfileRepository,
  ) {}

  /** 내 프로필 조회 */
  @Get()
  async getProfile(@CurrentUser() user: JwtPayload) {
    const profile = await this.profileRepo.findByUserId(user.sub)
    if (!profile) throw new NotFoundException({ code: 'PROFILE_NOT_FOUND', message: '프로필을 찾을 수 없습니다.' })
    return profile
  }

  /** 프로필 수정 */
  @Patch()
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    const profile = await this.profileRepo.findByUserId(user.sub)
    if (!profile) throw new NotFoundException({ code: 'PROFILE_NOT_FOUND', message: '프로필을 찾을 수 없습니다.' })

    const updated = await this.profileRepo.save({ ...profile, ...dto })

    // 완성도 재계산 후 업데이트
    const newScore = updated.calculateCompletionScore()
    await this.profileRepo.updateCompletionScore(updated.id, newScore)

    return { ...updated, completionScore: newScore }
  }

  /** 프로필 완성도 스코어 조회 */
  @Get('completion-score')
  async getCompletionScore(@CurrentUser() user: JwtPayload) {
    const profile = await this.profileRepo.findByUserId(user.sub)
    return { completionScore: profile?.completionScore ?? 0 }
  }

  /** 보유 스킬 목록 조회 */
  @Get('skills')
  async getSkills(@CurrentUser() user: JwtPayload) {
    const profile = await this.profileRepo.findByUserId(user.sub)
    return profile?.skills ?? []
  }

  /** 스킬 추가 */
  @Post('skills')
  @HttpCode(HttpStatus.CREATED)
  async addSkill(@CurrentUser() user: JwtPayload, @Body() dto: AddSkillDto) {
    const profile = await this.profileRepo.findByUserId(user.sub)
    if (!profile) throw new NotFoundException({ code: 'PROFILE_NOT_FOUND', message: '프로필을 찾을 수 없습니다.' })
    return this.profileRepo.addSkill(profile.id, dto.skillId, dto.proficiencyLevel)
  }

  /** 스킬 삭제 */
  @Delete('skills/:skillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSkill(
    @CurrentUser() user: JwtPayload,
    @Param('skillId', ParseIntPipe) skillId: number,
  ) {
    const profile = await this.profileRepo.findByUserId(user.sub)
    if (!profile) throw new NotFoundException({ code: 'PROFILE_NOT_FOUND', message: '프로필을 찾을 수 없습니다.' })
    await this.profileRepo.removeSkill(profile.id, skillId)
  }
}
