import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base/base.repository';
import { Agency, AgencyDocument } from '../schema/agency.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IAgencyRepository } from 'src/repositories/agency/agency.interface';

@Injectable()
export class AgencyRepository
  extends BaseRepository<AgencyDocument>
  implements IAgencyRepository
{
  constructor(
    @InjectModel(Agency.name)
    private readonly _agencyModel: Model<AgencyDocument>,
  ) {
    super(_agencyModel);
  }

  findAllAgenciesWithReviews(
    skip: number,
    limit: number,
  ): Promise<AgencyDocument[]> {
    return this._agencyModel
      .aggregate([
        {
          $match: { isVerified: true, isConfirmed: true, isActive: true },
        },
        {
          $lookup: {
            from: 'reviewforagencies',
            localField: '_id',
            foreignField: 'agencyId',
            as: 'ratings',
          },
        },
        {
          $project: {
            password: 0,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ])
      .exec();
  }

  findByEmail(
    email: string,
    isVerified = true,
  ): Promise<AgencyDocument | null> {
    return this._agencyModel.findOne({
      email,
      isVerified,
    });
  }

  async updatePassword(
    agencyId: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const updateResult = await this._agencyModel.updateOne(
      { _id: new Types.ObjectId(agencyId) },
      { $set: { password: hashedPassword } },
    );
    return updateResult.modifiedCount > 0;
  }

  countActiveVerifiedConfirmedAgencies(): Promise<number> {
    return this._agencyModel.countDocuments({
      isVerified: true,
      isConfirmed: true,
      isActive: true,
    });
  }

  findAllActiveVerifiedConfirmedAgencies(
    skip: number,
    limit: number,
  ): Promise<AgencyDocument[]> {
    return this._agencyModel
      .find(
        { isVerified: true, isConfirmed: true, isActive: true },
        { password: 0 },
      )
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async createAgency(agencyData: {
    name: string;
    email: string;
    password: string;
    place: string;
    phone: number;
    document: string;
  }): Promise<AgencyDocument> {
    const newAgency = new this._agencyModel(agencyData);
    return await newAgency.save();
  }
}
