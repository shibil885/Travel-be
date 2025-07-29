import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agency } from '../agency/schema/agency.schema';
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

  async updateConfirmationOfAgency(agencyId: string, action: string) {
    try {
      const confirmation = action == 'confirm';
      const updatedAgency = await this._adminRepository.confirmAgency(
        agencyId,
        confirmation,
      );

      if (!updatedAgency)
        throw new NotFoundException(AgencyErrorMessages.AGENCY_NOT_FOUND);
      return {
        isConfirmed: updatedAgency.isConfirmed,
        message:
          action == 'confirm'
            ? AgencySuccessMessages.AGENCY_APPROVED
            : AgencySuccessMessages.AGENCY_REJECTED,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException();
    }
  }

  async getFilteredData(filterData: FilterDataDto, user: 'user' | 'agency') {
    try {
      if (user !== 'user' && user !== 'agency') {
        throw new BadRequestException(
          'Type USER must be either "agency" or "user"',
        );
      }

      const { isActive, isVerified, isConfirmed } = filterData;

      const query: {
        isActive?: boolean;
        isVerified?: boolean;
        isConfirmed?: boolean;
      } = {};

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      if (isVerified !== undefined) {
        query.isVerified = isVerified;
      }

      if (user === 'agency' && isConfirmed !== undefined) {
        query.isConfirmed = isConfirmed;
      }

      const filteredData = await this._adminRepository.findWIthFilter(
        user,
        query,
      );

      if (!filteredData || filteredData.length === 0) {
        throw new NotFoundException(
          user === 'agency'
            ? AgencyErrorMessages.AGENCY_NOT_FOUND
            : UserErrorMessages.USER_NOT_FOUND,
        );
      }

      return {
        filteredData,
        message:
          user === 'agency'
            ? AgencySuccessMessages.AGENCY_LIST_FETCHED
            : UserSuccessMessages.USER_LIST_FETCHED,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to retrieve filtered data',
      );
    }
  }

  async searchUsers(searchText: string, userType: 'user' | 'agency') {
    try {
      const users = await this._adminRepository.searchUsers(
        userType,
        searchText,
      );

      if (!users || users.length === 0) {
        throw new NotFoundException(
          userType == 'agency'
            ? AgencyErrorMessages.AGENCY_NOT_FOUND
            : UserErrorMessages.USER_NOT_FOUND,
        );
      }
      return {
        users,
        message:
          userType == 'user'
            ? UserSuccessMessages.USER_LIST_FETCHED
            : AgencySuccessMessages.AGENCY_LIST_FETCHED,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to search users');
    }
  }
}
