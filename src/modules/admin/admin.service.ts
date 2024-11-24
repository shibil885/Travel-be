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
import { FilterDataDto } from 'src/common/dtos/filterData.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private _AdminModel: Model<Admin>,
    @InjectModel(Agency.name) private _AgencyModel: Model<Agency>,
    @InjectModel(User.name) private _UserModel: Model<User>,
  ) {}

  async findAllAgencies(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [agencies, totalAgencies] = await Promise.all([
      this._AgencyModel.find({ isVerified: true }).skip(skip).limit(pageSize),
      this._AgencyModel.countDocuments({ isVerified: true }),
    ]);

    return {
      agencies,
      totalAgencies: totalAgencies,
      currentPage: page,
    };
  }

  async findAllUsers(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [users, totalUsers] = await Promise.all([
      this._UserModel.find({ isVerified: true }).skip(skip).limit(pageSize),
      this._UserModel.countDocuments({ isVerified: true }),
    ]);

    return {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / pageSize),
      currentPage: page,
    };
  }

  async findOne(email: string, password: string) {
    const admin = await this._AdminModel.findOne({
      email: email,
      password: password,
    });
    return admin ? admin : null;
  }

  async findAdmin(email: string) {
    try {
      const admin = await this._AdminModel.findOne({ email: email });
      if (!admin) return null;
      return admin;
    } catch (error) {
      console.log('Error occured while fetching Admin:', error);
      throw new InternalServerErrorException();
    }
  }
  async changeAgencyStatus(id: string, res: Response, action: string) {
    try {
      const agency = await this._AgencyModel.findById(id);
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
      const user = await this._UserModel.findById(id);
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
      user.isActive = action === 'unblock';
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
      const agency = await this._AgencyModel.findById(id);
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
  async getFilteredData(filterData: FilterDataDto, user: string) {
    const { isActive, isVerified, isConfirmed } = filterData;
    let query: { isActive: boolean; isVerified: boolean; isConfirmed: boolean };

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (isVerified !== undefined) {
      query.isVerified = isVerified;
    }

    if (user === 'agency' && isConfirmed !== undefined) {
      query.isConfirmed = isConfirmed;
    }
    let filteredData;
    try {
      if (user === 'agency') {
        filteredData = await this._AgencyModel.find(query).exec();
      } else if (user === 'user') {
        filteredData = await this._UserModel.find(query).exec();
      } else {
        throw new Error('Invalid user type provided.');
      }

      return filteredData;
    } catch (error) {
      console.error('Error fetching filtered data:', error.message);
      return new Error('Failed to retrieve filtered data');
    }
  }

  async searchUsers(searchText: string, user: string) {
    try {
      let searchResult;
      if (user === 'agency') {
        searchResult = await this._AgencyModel
          .find({
            $or: [
              { name: { $regex: searchText, $options: 'i' } },
              { email: { $regex: searchText, $options: 'i' } },
            ],
          })
          .exec();
      } else if (user === 'user') {
        searchResult = await this._UserModel
          .find({
            $or: [
              { username: { $regex: searchText, $options: 'i' } },
              { email: { $regex: searchText, $options: 'i' } },
            ],
          })
          .exec();
      } else {
        throw new Error('Invalid user type');
      }
      return searchResult;
    } catch (error) {
      console.error('Error searching users:', error.message);
      return new Error('Failed to search users. Please try again later.');
    }
  }
}
