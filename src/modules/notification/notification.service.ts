import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './schema/notification.schema';
import { Model } from 'mongoose';
import { mailsenderFunc } from 'src/utils/mailSender.util';
import { Admin } from '../admin/schema/admin.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private NotificationModel: Model<Notification>,
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
      const newNotification = new this.NotificationModel({
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

  async findAll(): Promise<Notification[]> {
    try {
      return await this.NotificationModel.find({ is_deleted: false }).exec();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Could not fetch notifications.');
    }
  }

  async findAllUnread(): Promise<Notification[]> {
    try {
      return await this.NotificationModel.find({ is_read: false }).exec();
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw new Error('Could not fetch unread notifications.');
    }
  }

  async findById(id: string): Promise<Notification> {
    try {
      return await this.NotificationModel.findById(id).exec();
    } catch (error) {
      console.error(`Error fetching notification with id ${id}:`, error);
      throw new Error('Could not fetch notification.');
    }
  }

  async markAsRead(id: string): Promise<Notification> {
    try {
      return await this.NotificationModel.findByIdAndUpdate(
        id,
        { is_read: true, read_at: new Date() },
        { new: true },
      ).exec();
    } catch (error) {
      console.error(`Error marking notification as read for id ${id}:`, error);
      throw new Error('Could not mark notification as read.');
    }
  }

  async delete(id: string): Promise<Notification> {
    try {
      return await this.NotificationModel.findByIdAndUpdate(
        id,
        { is_deleted: true },
        { new: true },
      ).exec();
    } catch (error) {
      console.error(`Error deleting notification with id ${id}:`, error);
      throw new Error('Could not delete notification.');
    }
  }
}
