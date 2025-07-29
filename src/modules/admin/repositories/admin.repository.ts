import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from '../schema/admin.schema';
import { BaseRepository } from 'src/repositories/base.repository';
import {
  Agency,
  AgencyDocument,
} from 'src/modules/agency/schema/agency.schema';
import { Model } from 'mongoose';

@Injectable()
export class AdminRepository extends BaseRepository<AdminDocument> {
  private _agencyRepository: BaseRepository<AgencyDocument>;
  constructor(
    @InjectModel(Admin.name) private _adminModel: Model<AdminDocument>,
    @InjectModel(Agency.name) private _agencyModel: Model<AgencyDocument>,
  ) {
    super(_adminModel);
    this._agencyRepository = new BaseRepository<AgencyDocument>(_agencyModel);
  }

  findAllAgenciesWithpaginationAndFilter(limit: number, skip: number) {
    return this._agencyRepository.findAllWithPaginationAndFilter(
      { isVerified: true },
      skip,
      limit,
    );
  }
  countAllAgenciesWithFilter() {
    return this._agencyRepository.countDocument({ isVerified: true });
  }
}
