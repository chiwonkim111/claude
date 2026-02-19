/**
 * 회원가입 유스케이스
 * - 이메일 중복 확인 후 bcrypt 해싱 비밀번호로 사용자 생성
 * - 가입 완료 후 빈 프로필 자동 생성
 */
import { Injectable, ConflictException, Inject } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UserRepository, USER_REPOSITORY } from '../../domain/user/user.repository'
import { ProfileRepository, PROFILE_REPOSITORY } from '../../domain/profile/profile.repository'

export interface RegisterInput {
  email: string
  password: string
  name: string
}

export interface RegisterOutput {
  userId: number
  email: string
  name: string
}

const BCRYPT_SALT_ROUNDS = 12

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepo: ProfileRepository,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    // 1. 이메일 중복 확인
    const existing = await this.userRepo.findByEmail(input.email)
    if (existing) {
      throw new ConflictException({
        code: 'AUTH_EMAIL_ALREADY_EXISTS',
        message: '이미 사용 중인 이메일입니다.',
      })
    }

    // 2. 비밀번호 해싱 (bcrypt cost 12)
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS)

    // 3. 사용자 생성
    const user = await this.userRepo.save({
      email: input.email,
      passwordHash,
      name: input.name,
      status: 'active',
    })

    // 4. 빈 프로필 자동 생성 (1:1 관계)
    await this.profileRepo.save({
      userId: user.id,
      yearsOfExperience: 0,
      isJobSeeking: false,
      completionScore: 0,
    })

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    }
  }
}
