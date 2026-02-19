/**
 * TypeORM 사용자 ORM 엔티티
 * - PostgreSQL users 테이블 매핑
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
} from 'typeorm'

@Entity('users')
@Index('idx_users_email', ['email'])
@Index('idx_users_status', ['status'])
export class UserOrmEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string

  @Column({ type: 'varchar', length: 50 })
  name: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status: 'active' | 'suspended' | 'deleted'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
