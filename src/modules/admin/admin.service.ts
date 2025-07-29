import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agency } from '../agency/schema/agency.schema';
import { Response } from 'express';
import { User } from '../user/schemas/user.schema';
import { FilterDataDto } from 'src/common/dtos/filterData.dto';
import { AdminRepository } from './repositories/admin.repository';
import {
  AdminErrorMessages,
  AgencyErrorMessages,
  AgencySuccessMessages,
  GeneralErrorMessages,
  UserErrorMessages,
  UserSuccessMessages,
} from 'src/common/constants/messages';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Agency.name) private _AgencyModel: Model<Agency>,
    @InjectModel(User.name) private _UserModel: Model<User>,
    private readonly _adminRepository: AdminRepository,
  ) {}

  async getPaginatedVerifiedAgencies(page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;
      const [agencies, totalAgencies] = await Promise.all([
        this._adminRepository.findPaginatedVerifiedAgencies(pageSize, skip),
        this._adminRepository.countVerifiedAgencies(),
      ]);

      if (!totalAgencies)
        throw new NotFoundException(AgencyErrorMessages.AGENCY_NOT_FOUND);
      return {
        agencies,
        totalAgencies: totalAgencies,
        currentPage: page,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException();
    }
  }

  async getPaginatedVerifiedUsers(page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;

      const [users, totalUsers] = await Promise.all([
        this._adminRepository.findPaginatedVerifiedUsers(pageSize, skip),
        this._adminRepository.countVerifiedUsers(),
      ]);

      if (!totalUsers)
        throw new NotFoundException(UserErrorMessages.USER_NOT_FOUND);

      return {
        users,
        totalUsers,
        currentPage: page,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException();
    }
  }

  async getAdmin(email: string, password: string) {
    try {
      const admin = await this._adminRepository.findOne(
        { email, password },
        { password: 0 },
      );

      if (!admin) {
        throw new NotFoundException(AdminErrorMessages.ADMIN_NOT_FOUND);
      }

      return admin;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async getAdminWithMail(email: string) {
    try {
      const admin = await this._adminRepository.findOne({ email: email });
      if (!admin)
        throw new NotFoundException(AdminErrorMessages.ADMIN_NOT_FOUND);
      return admin;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException();
    }
  }

  async updateAgencyStatus(agencyId: string, action: string) {
    try {
      const status: boolean = action !== 'block';
      const updatedAgency = await this._adminRepository.updateAgencyById(
        agencyId,
        status,
      );
      if (!updatedAgency)
        throw new NotFoundException(AgencyErrorMessages.AGENCY_NOT_FOUND);
      return {
        isActive: updatedAgency.isActive,
        message: status
          ? AgencySuccessMessages.AGENCY_ACTIVATED
          : AgencySuccessMessages.AGENCY_DEACTIVATED,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException();
    }
  }

  async updateUserStatus(userId: string, action: string) {
    try {
      const status: boolean = action !== 'block';
      const updatedUser = await this._adminRepository.updateUserById(
        userId,
        status,
      );

      if (!updatedUser)
        throw new NotFoundException(UserErrorMessages.USER_NOT_FOUND);
      return {
        isActive: updatedUser.isActive,
        message: status
          ? UserSuccessMessages.USER_ACTIVATED
          : UserSuccessMessages.USER_DEACTIVATED,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException();
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
