/**
 * TypeORM 체크인 질문 ORM 엔티티
 * - PostgreSQL checkin_questions 테이블 매핑
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('checkin_questions')
export class CheckinQuestionOrmEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ name: 'checkin_session_id', type: 'bigint' })
  checkinSessionId: number

  @Column({ name: 'question_text', type: 'text' })
  questionText: string

  @Column({ name: 'question_order', type: 'int' })
  questionOrder: number

  @Column({ name: 'answer_text', type: 'text', nullable: true })
  answerText: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
