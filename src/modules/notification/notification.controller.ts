import {
  BadRequestException,
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

  @Get(':role/:isRead')
  async getNotification(
    @Req() req: Request,
    @Res() res: Response,
    @Param('role') role: string,
    @Param('isRead') isRead: boolean,
    @Query('limit') limit: number,
  ) {
    try {
      const result = await this._notificationService.findNotifications(
        req[role]['sub'],
        isRead,
        limit,
      );
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
  async markNotificationAsRead(@Res() res: Response, @Param('id') id: string) {
    try {
      if (!id) throw new BadRequestException('Id not found');
      await this._notificationService.markAsRead(id);
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: 'Message read' });
    } catch (error) {
      if (error instanceof BadRequestException) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, error: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: error.message });
    }
  }

  @Patch(':id/delete')
  async softDeleteNotification(@Param('id') id: string): Promise<Notification> {
    return this._notificationService.delete(id);
  }
}
