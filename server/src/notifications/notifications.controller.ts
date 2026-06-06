import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../types/user.types';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async send(
    @Body() dto: SendNotificationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.notificationsService.send(dto, user);
  }

  @Get()
  async getAll(@CurrentUser() user: JwtPayload) {
    if (user.role === 'client') {
      return this.notificationsService.findForClient(user.sub);
    }
    return this.notificationsService.findAll();
  }
}
