/**
 * 사용자 도메인 엔티티
 * - 이메일/비밀번호 기반 인증 사용자 정보 관리
 */
export class User {
  id: number
  email: string
  passwordHash: string
  name: string
  phone: string | null
  status: 'active' | 'suspended' | 'deleted'
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<User>) {
    Object.assign(this, partial)
  }

  /** 계정 활성 상태 여부 확인 */
  isActive(): boolean {
    return this.status === 'active'
  }
}
