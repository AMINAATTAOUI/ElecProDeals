import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../database/entities/notification.entity';
import type { SendNotificationDto } from '../types/notification.types';
import type { JwtPayload } from '../types/user.types';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationsRepo: Repository<NotificationEntity>,
  ) {}

  async send(dto: SendNotificationDto, sender: JwtPayload): Promise<NotificationEntity> {
    if (sender.role === 'client') {
      throw new ForbiddenException('Seuls les admins et commerciaux peuvent envoyer des notifications');
    }

    const notification = this.notificationsRepo.create({
      title: dto.title,
      body: dto.body,
      targetClientId: dto.targetClientId ?? null,
      sentById: sender.sub,
      status: 'sent',
    });

    return this.notificationsRepo.save(notification);
  }

  async findAll(): Promise<NotificationEntity[]> {
    return this.notificationsRepo.find({
      order: { sentAt: 'DESC' },
      take: 100,
    });
  }

  async findForClient(clientId: string): Promise<NotificationEntity[]> {
    return this.notificationsRepo.find({
      where: [
        { targetClientId: clientId },
        { targetClientId: null as unknown as string },
      ],
      order: { sentAt: 'DESC' },
      take: 50,
    });
  }
}
