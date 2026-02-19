/**
 * 알림 모듈
 */
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificationController } from './notification.controller'
import { NotificationTypeOrmRepository } from '../../../infrastructure/database/repositories/notification.typeorm-repository'
import { NotificationLogOrmEntity } from '../../../infrastructure/database/typeorm/entities/notification-log.orm-entity'
import { NotificationSettingsOrmEntity } from '../../../infrastructure/database/typeorm/entities/notification-settings.orm-entity'
import { NOTIFICATION_REPOSITORY } from '../../../domain/notification/notification.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationLogOrmEntity, NotificationSettingsOrmEntity]),
  ],
  controllers: [NotificationController],
  providers: [
    { provide: NOTIFICATION_REPOSITORY, useClass: NotificationTypeOrmRepository },
  ],
})
export class NotificationModule {}
