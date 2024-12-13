import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './schema/notification.schema';
import { Model, Types } from 'mongoose';
import { mailsenderFunc } from 'src/utils/mailSender.util';
import { Admin } from '../admin/schema/admin.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private _NotificationModel: Model<Notification>,
    @InjectModel(Admin.name)
    private AdminModel: Model<Admin>,
  ) {}

  async agencyRegistration(agencyName: string, email: string, id: string) {
    try {
      const admin = await this.AdminModel.find();
      const adminId = admin[0].id;
      await mailsenderFunc(
        email,
        'Registration Successful - Awaiting Admin Approval',
        'agencyRegistration',
        { agencyName },
      );
      const newNotification = new this._NotificationModel({
        from_id: id,
        from_model: 'Agency',
        to_id: adminId,
        to_model: 'Admin',
        title: 'New Agency Registration',
        description: `The agency ${agencyName} has been successfully registered and verified.`,
        type: 'info',
        priority: 2,
      });

      return await newNotification.save();
    } catch (error) {
      console.log('error occured while send and save notification', error);
    }
  }

  // async newCategoryCreation(id: string, categoryName: string) {
  //   try {
  //     const admin = await this.AdminModel.find();
  //     const adminId = admin[0].id;
  //     const newNotification = new this.NotificationModel({
  //       from_id: adminId,
  //       from_model: 'Admin',
  //       to_id: id,
  //       to_model: 'Agency',
  //       title: 'New Category Created',
  //       description: `Admin has created a new category: ${categoryName}, now available for all agencies`,
  //       type: 'info',
  //       priority: 2,
  //     });
  //     await newNotification.save();
  //     return true;
  //   } catch (error) {
  //     console.log('error occured while save notification to data base', error);
  //     return false;
  //   }
  // }

  async findAll(): Promise<Notification[]> {
    try {
      return await this._NotificationModel.find({ is_deleted: false }).exec();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Could not fetch notifications.');
    }
  }

  async findNotifications(
    to_id: string,
    is_read: boolean,
    limit: number = Infinity,
  ) {
    try {
      const notifications = await this._NotificationModel
        .find({
          to_id: new Types.ObjectId(to_id),
          is_deleted: false,
          is_read: is_read,
        })
        .sort({ createdAt: -1 })
        .limit(limit);
      return notifications;
    } catch (error) {
      console.log('Error occured while fetching all notifications', error);
      throw error;
    }
  }

  async findAllUnread(): Promise<Notification[]> {
    try {
      return await this._NotificationModel.find({ is_read: false }).exec();
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw new Error('Could not fetch unread notifications.');
    }
  }

  async markAsRead(id: string): Promise<Notification> {
    try {
      return await this._NotificationModel
        .findByIdAndUpdate(
          id,
          { is_read: true, read_at: new Date() },
          { new: true },
        )
        .exec();
    } catch (error) {
      console.error(`Error marking notification as read for id ${id}:`, error);
      throw new Error('Could not mark notification as read.');
    }
  }

  async delete(id: string): Promise<Notification> {
    try {
      return await this._NotificationModel
        .findByIdAndUpdate(id, { is_deleted: true }, { new: true })
        .exec();
    } catch (error) {
      console.error(`Error deleting notification with id ${id}:`, error);
      throw new Error('Could not delete notification.');
    }
  }

  async createNotification(notificationData: {
    fromId: Types.ObjectId;
    fromModel: string;
    toId: Types.ObjectId;
    toModel: string;
    title: string;
    description: string;
    type?: string;
    priority?: number;
  }) {
    const {
      fromId,
      fromModel,
      toId,
      toModel,
      title,
      description,
      type = 'info',
      priority = 2,
    } = notificationData;

    const newNotification = new this._NotificationModel({
      from_id: fromId,
      from_model: fromModel,
      to_id: toId,
      to_model: toModel,
      title,
      description,
      type,
      priority,
    });

    try {
      await newNotification.save();
      console.log('Notification created successfully');
      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new InternalServerErrorException('Failed to create notification');
    }
  }
}
