import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from '../schema/admin.schema';
import { BaseRepository } from 'src/repositories/base.repository';
import {
  Agency,
  AgencyDocument,
} from 'src/modules/agency/schema/agency.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/modules/user/schemas/user.schema';

@Injectable()
export class AdminRepository extends BaseRepository<AdminDocument> {
  private _agencyRepository: BaseRepository<AgencyDocument>;
  private _userRepository: BaseRepository<UserDocument>;
  constructor(
    @InjectModel(Admin.name) private _adminModel: Model<AdminDocument>,
    @InjectModel(Agency.name) private _agencyModel: Model<AgencyDocument>,
    @InjectModel(User.name) private _userModel: Model<UserDocument>,
  ) {
    super(_adminModel);
    this._agencyRepository = new BaseRepository<AgencyDocument>(_agencyModel);
    this._userRepository = new BaseRepository<UserDocument>(_userModel);
  }

  findPaginatedVerifiedAgencies(limit: number, skip: number) {
    return this._agencyRepository.findAllWithPaginationAndFilter(
      { isVerified: true },
      skip,
      limit,
      { password: 0 },
    );
  }
  countVerifiedAgencies() {
    return this._agencyRepository.countDocument({ isVerified: true });
  }

  findPaginatedVerifiedUsers(limit: number, skip: number) {
    return this._userRepository.findAllWithPaginationAndFilter(
      {
        isVerified: true,
      },
      skip,
      limit,
      { password: 0 },
    );
  }

  countVerifiedUsers() {
    return this._userRepository.countDocument({ isVerified: true });
  }

  updateAgencyById(
    agencyId: string,
    action: boolean,
  ): Promise<AgencyDocument | null> {
    return this._agencyRepository.update(agencyId, { isActive: action });
  }
}
