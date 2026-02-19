/**
 * TypeORM 사용자 리포지토리 구현체
 * - 도메인 UserRepository 인터페이스를 TypeORM으로 구현
 */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../../domain/user/user.entity'
import { UserRepository } from '../../../domain/user/user.repository'
import { UserOrmEntity } from '../typeorm/entities/user.orm-entity'

@Injectable()
export class UserTypeOrmRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: number): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { id } })
    return entity ? this.toDomain(entity) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { email } })
    return entity ? this.toDomain(entity) : null
  }

  async save(user: Partial<User>): Promise<User> {
    const entity = this.repo.create(this.toOrm(user))
    const saved = await this.repo.save(entity)
    return this.toDomain(saved)
  }

  /** ORM 엔티티 → 도메인 엔티티 변환 */
  private toDomain(entity: UserOrmEntity): User {
    return new User({
      id: Number(entity.id),
      email: entity.email,
      passwordHash: entity.passwordHash,
      name: entity.name,
      phone: entity.phone,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })
  }

  /** 도메인 엔티티 → ORM 엔티티 변환 */
  private toOrm(user: Partial<User>): Partial<UserOrmEntity> {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      phone: user.phone ?? null,
      status: user.status,
    }
  }
}
