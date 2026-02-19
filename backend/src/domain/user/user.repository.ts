/**
 * 사용자 리포지토리 인터페이스 (도메인 레이어)
 * - 인프라 레이어의 TypeORM 구현체에 의존성 역전 적용
 */
import { User } from './user.entity'

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

export interface UserRepository {
  /** ID로 사용자 조회 */
  findById(id: number): Promise<User | null>

  /** 이메일로 사용자 조회 */
  findByEmail(email: string): Promise<User | null>

  /** 사용자 저장 (생성/수정) */
  save(user: Partial<User>): Promise<User>
}
