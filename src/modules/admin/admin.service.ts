import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './schema/admin.schema';
import { Model } from 'mongoose';

@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin.name) private AdminModel: Model<Admin>) {}
  async findOne(email: string, password: string) {
    const admin = await this.AdminModel.findOne({
      email: email,
      password: password,
    });
    if (!admin) return null;

    return {
      id: admin.id,
    };
  }
}
