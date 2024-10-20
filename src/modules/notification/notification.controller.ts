import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './schema/notification.schema';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Get()
  async getAllNotifications(): Promise<Notification[]> {
    return this.notificationService.findAll();
  }
  @Get('unread')
  async getAllUnreadNotifications(): Promise<Notification[]> {
    return this.notificationService.findAllUnread();
  }

  @Get(':id')
  async getNotificationById(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.findById(id);
  }

  @Patch(':id/read')
  async markNotificationAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.markAsRead(id);
  }

  @Patch(':id/delete')
  async softDeleteNotification(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.delete(id);
  }
}
