/**
 * TypeORM 스킬 마스터 ORM 엔티티
 * - PostgreSQL skills 테이블 매핑
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity('skills')
export class SkillOrmEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string

  @Column({ type: 'varchar', length: 50 })
  category: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
