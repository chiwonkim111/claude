/**
 * TypeORM 알림 리포지토리 구현체
 */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NotificationLog } from '../../../domain/notification/notification-log.entity'
import { NotificationSettings } from '../../../domain/notification/notification-settings.entity'
import { NotificationRepository } from '../../../domain/notification/notification.repository'
import { NotificationLogOrmEntity } from '../typeorm/entities/notification-log.orm-entity'
import { NotificationSettingsOrmEntity } from '../typeorm/entities/notification-settings.orm-entity'

export const NOTIFICATION_REPOSITORY_IMPL = Symbol('NOTIFICATION_REPOSITORY_IMPL')

@Injectable()
export class NotificationTypeOrmRepository implements NotificationRepository {
  constructor(
    @InjectRepository(NotificationLogOrmEntity)
    private readonly logRepo: Repository<NotificationLogOrmEntity>,
    @InjectRepository(NotificationSettingsOrmEntity)
    private readonly settingsRepo: Repository<NotificationSettingsOrmEntity>,
  ) {}

  async findLogsByUserId(userId: number): Promise<NotificationLog[]> {
    const entities = await this.logRepo.find({
      where: { userId },
      order: { sentAt: 'DESC' },
      take: 50,
    })
    return entities.map(this.logToDomain)
  }

  async saveLog(log: Partial<NotificationLog>): Promise<NotificationLog> {
    const entity = this.logRepo.create({
      userId: log.userId,
      type: log.type,
      title: log.title,
      body: log.body,
      sentAt: log.sentAt ?? new Date(),
      isRead: false,
      readAt: null,
    })
    const saved = await this.logRepo.save(entity)
    return this.logToDomain(saved)
  }

  async markAsRead(logId: number): Promise<void> {
    await this.logRepo.update(logId, { isRead: true, readAt: new Date() })
  }

  async findSettingsByUserId(userId: number): Promise<NotificationSettings | null> {
    const entity = await this.settingsRepo.findOne({ where: { userId } })
    return entity ? this.settingsToDomain(entity) : null
  }

  async saveSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const entity = this.settingsRepo.create({
      id: settings.id,
      userId: settings.userId,
      checkinReminderEnabled: settings.checkinReminderEnabled ?? true,
      checkinReminderDaysBefore: settings.checkinReminderDaysBefore ?? 14,
      checkinReminderTime: settings.checkinReminderTime ?? '09:00',
      marketValueAlertEnabled: settings.marketValueAlertEnabled ?? true,
      peerRequestEnabled: settings.peerRequestEnabled ?? true,
    })
    const saved = await this.settingsRepo.save(entity)
    return this.settingsToDomain(saved)
  }

  private logToDomain(entity: NotificationLogOrmEntity): NotificationLog {
    return new NotificationLog({
      id: Number(entity.id),
      userId: Number(entity.userId),
      type: entity.type,
      title: entity.title,
      body: entity.body,
      sentAt: entity.sentAt,
      isRead: entity.isRead,
      readAt: entity.readAt,
      createdAt: entity.createdAt,
    })
  }

  private settingsToDomain(entity: NotificationSettingsOrmEntity): NotificationSettings {
    return new NotificationSettings({
      id: Number(entity.id),
      userId: Number(entity.userId),
      checkinReminderEnabled: entity.checkinReminderEnabled,
      checkinReminderDaysBefore: entity.checkinReminderDaysBefore,
      checkinReminderTime: entity.checkinReminderTime,
      marketValueAlertEnabled: entity.marketValueAlertEnabled,
      peerRequestEnabled: entity.peerRequestEnabled,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })
  }
}
