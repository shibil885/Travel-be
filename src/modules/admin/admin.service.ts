import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './schema/admin.schema';
import { Model } from 'mongoose';
import { Agency } from '../agency/schema/agency.schema';
import { Response } from 'express';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private AdminModel: Model<Admin>,
    @InjectModel(Agency.name) private AgencyModel: Model<Agency>,
    @InjectModel(User.name) private UserModel: Model<User>,
  ) {}

  async findAllAgencies(res: Response) {
    try {
      const agencies = await this.AgencyModel.find();
      if (!agencies) {
        return res
          .status(HttpStatus.OK)
          .json({ message: 'No Agencies', success: false });
      }
      console.log('agencies', agencies);
      return res.status(HttpStatus.OK).json({
        message: 'List of Agencies',
        success: true,
        agencies: agencies,
      });
    } catch (error) {
      console.log('Error while fetching all Agencies:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal Server Error', success: false });
    }
  }

  async findAllUsers(res: Response) {
    try {
      const Users = await this.UserModel.find();
      if (!Users) {
        return res
          .status(HttpStatus.OK)
          .json({ message: 'No Users', success: false });
      }
      return res
        .status(HttpStatus.OK)
        .json({ message: 'List of Users', success: true, users: Users });
    } catch (error) {
      console.log('Error while fetching all Users:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal Server Error', success: false });
    }
  }

  async findOne(email: string, password: string) {
    const admin = await this.AdminModel.findOne({
      email: email,
      password: password,
    });
    if (!admin) return null;

    return admin;
  }
  async findAdmin(email: string) {
    try {
      const admin = await this.AdminModel.findOne({ email: email });
      if (!admin) return null;
      return admin;
    } catch (error) {
      console.log('Error occured while fetching Admin:', error);
      throw new InternalServerErrorException();
    }
  }
  async changeAgencyStatus(id: string, res: Response, action: string) {
    try {
      console.log(id, action);
      const agency = await this.AgencyModel.findById(id);
      console.log(agency);
      if (!agency) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Agency Not Found', success: false });
      }
      if (action !== 'block' && action !== 'unblock') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: 'Invalid Action' });
      }
      agency.isActive = action === 'unblock';
      await agency.save();
      return res.status(HttpStatus.OK).json({
        message: `User successfully ${action}ed`,
        success: true,
      });
    } catch (error) {
      console.log('Error while changing agency status:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }

  async changeUserStatus(id: string, res: Response, action: string) {
    try {
      const user = await this.UserModel.findById(id);
      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'User Not Found', success: false });
      }
      if (action !== 'block' && action !== 'unblock') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: 'Invalid Action' });
      }
      user.is_Active = action === 'unblock';
      await user.save();
      return res.status(HttpStatus.OK).json({
        message: `User successfully ${action}ed`,
        success: true,
      });
    } catch (error) {
      console.log('Error while changing user status:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
  async confirmation(id: string, res: Response, action: string) {
    try {
      console.log('ffffffffffff', action);
      const agency = await this.AgencyModel.findById(id);
      if (!agency) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Agency Not Found', success: false });
      }
      if (action !== 'declin' && action !== 'confirm') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: 'Invalid Action' });
      }
      agency.isConfirmed = action === 'confirm';
      await agency.save();
      return res.status(HttpStatus.OK).json({
        message: `Agency successfully ${action}ed`,
        success: true,
      });
    } catch (error) {
      console.log('Error while changing Agency status:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
}
