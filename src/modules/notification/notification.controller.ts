import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './schema/notification.schema';
import { Request, Response } from 'express';

@Controller('notification')
export class NotificationController {
  constructor(private readonly _notificationService: NotificationService) {}
  @Get()
  async getAllNotifications(): Promise<Notification[]> {
    return this._notificationService.findAll();
  }
  @Get('unread')
  async getAllUnreadNotifications(): Promise<Notification[]> {
    return this._notificationService.findAllUnread();
  }

  @Get(':role')
  async getNotification(
    @Req() req: Request,
    @Res() res: Response,
    @Param('role') role: string,
    @Query('limit') limit: number,
  ) {
    try {
      const result = await this._notificationService.findNotifications(
        req[role]['sub'],
        limit,
      );
      console.log('notification', result);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'List of notifications',
        notifications: result,
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Patch(':id/read')
  async markNotificationAsRead(@Param('id') id: string): Promise<Notification> {
    return this._notificationService.markAsRead(id);
  }

  @Patch(':id/delete')
  async softDeleteNotification(@Param('id') id: string): Promise<Notification> {
    return this._notificationService.delete(id);
  }
}
