/**
 * TypeORM 체크인 리포지토리 구현체
 */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CheckinSession } from '../../../domain/checkin/checkin-session.entity'
import { CheckinQuestion } from '../../../domain/checkin/checkin-question.entity'
import { CheckinRepository } from '../../../domain/checkin/checkin.repository'
import { CheckinSessionOrmEntity } from '../typeorm/entities/checkin-session.orm-entity'
import { CheckinQuestionOrmEntity } from '../typeorm/entities/checkin-question.orm-entity'

@Injectable()
export class CheckinTypeOrmRepository implements CheckinRepository {
  constructor(
    @InjectRepository(CheckinSessionOrmEntity)
    private readonly sessionRepo: Repository<CheckinSessionOrmEntity>,
    @InjectRepository(CheckinQuestionOrmEntity)
    private readonly questionRepo: Repository<CheckinQuestionOrmEntity>,
  ) {}

  async findSessionsByUserId(userId: number): Promise<CheckinSession[]> {
    const entities = await this.sessionRepo.find({
      where: { userId },
      order: { year: 'DESC', quarter: 'DESC' },
    })
    return entities.map(this.sessionToDomain)
  }

  async findSessionById(id: number): Promise<CheckinSession | null> {
    const entity = await this.sessionRepo.findOne({ where: { id } })
    return entity ? this.sessionToDomain(entity) : null
  }

  async findSessionByQuarter(userId: number, quarter: string, year: number): Promise<CheckinSession | null> {
    const entity = await this.sessionRepo.findOne({
      where: { userId, quarter: quarter as CheckinSession['quarter'], year },
    })
    return entity ? this.sessionToDomain(entity) : null
  }

  async saveSession(session: Partial<CheckinSession>): Promise<CheckinSession> {
    const entity = this.sessionRepo.create({
      id: session.id,
      userId: session.userId,
      quarter: session.quarter,
      year: session.year,
      status: session.status,
      startedAt: session.startedAt ?? null,
      completedAt: session.completedAt ?? null,
    })
    const saved = await this.sessionRepo.save(entity)
    return this.sessionToDomain(saved)
  }

  async findQuestionsBySessionId(sessionId: number): Promise<CheckinQuestion[]> {
    const entities = await this.questionRepo.find({
      where: { checkinSessionId: sessionId },
      order: { questionOrder: 'ASC' },
    })
    return entities.map(this.questionToDomain)
  }

  async findQuestionById(id: number): Promise<CheckinQuestion | null> {
    const entity = await this.questionRepo.findOne({ where: { id } })
    return entity ? this.questionToDomain(entity) : null
  }

  async saveQuestions(questions: Partial<CheckinQuestion>[]): Promise<CheckinQuestion[]> {
    const entities = questions.map((q) =>
      this.questionRepo.create({
        checkinSessionId: q.checkinSessionId,
        questionText: q.questionText,
        questionOrder: q.questionOrder,
        answerText: q.answerText ?? null,
      }),
    )
    const saved = await this.questionRepo.save(entities)
    return saved.map(this.questionToDomain)
  }

  async updateAnswer(questionId: number, answerText: string): Promise<CheckinQuestion> {
    await this.questionRepo.update(questionId, { answerText, updatedAt: new Date() })
    const updated = await this.questionRepo.findOneOrFail({ where: { id: questionId } })
    return this.questionToDomain(updated)
  }

  /** 세션 ORM → 도메인 변환 */
  private sessionToDomain(entity: CheckinSessionOrmEntity): CheckinSession {
    return new CheckinSession({
      id: Number(entity.id),
      userId: Number(entity.userId),
      quarter: entity.quarter,
      year: entity.year,
      status: entity.status,
      startedAt: entity.startedAt,
      completedAt: entity.completedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })
  }

  /** 질문 ORM → 도메인 변환 */
  private questionToDomain(entity: CheckinQuestionOrmEntity): CheckinQuestion {
    return new CheckinQuestion({
      id: Number(entity.id),
      checkinSessionId: Number(entity.checkinSessionId),
      questionText: entity.questionText,
      questionOrder: entity.questionOrder,
      answerText: entity.answerText,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })
  }
}
