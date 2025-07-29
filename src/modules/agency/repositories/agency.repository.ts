import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base/base.repository';
import { Agency, AgencyDocument } from '../schema/agency.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AgencyRepository extends BaseRepository<AgencyDocument> {
  constructor(
    @InjectModel(Agency.name)
    private readonly _agencyModel: Model<AgencyDocument>,
  ) {
    super(_agencyModel);
  }
}
