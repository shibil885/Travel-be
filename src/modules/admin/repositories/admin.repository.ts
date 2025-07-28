import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from '../schema/admin.schema';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/repositories/base.repository';

@Injectable()
export class AdminRepository extends BaseRepository<AdminDocument> {
  constructor(
    @InjectModel(Admin.name) private _adminModel: Model<AdminDocument>,
  ) {
    super(_adminModel);
  }
}
