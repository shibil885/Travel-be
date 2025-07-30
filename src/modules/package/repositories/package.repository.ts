import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Package,
  PackageDocument,
} from 'src/modules/package/schema/package.schema';
import { BaseRepository } from 'src/repositories/base/base.repository';
import { IPackageRepository } from 'src/repositories/package/package.repository';

@Injectable()
export class PackageRepository
  extends BaseRepository<PackageDocument>
  implements IPackageRepository
{
  constructor(
    @InjectModel(Package.name) private _packageModel: Model<PackageDocument>,
  ) {
    super(_packageModel);
  }

  async findPackagesByAgencyWithPagination(
    agencyId: string,
    skip: number,
    limit: number,
  ): Promise<{ packages: any[]; totalCount: number }> {
    const [packages, totalCount] = await Promise.all([
      this._packageModel
        .aggregate([
          { $match: { agencyId: new Types.ObjectId(agencyId) } },
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            },
          },
          { $unwind: '$category' },
          {
            $lookup: {
              from: 'reviewforpackages',
              localField: '_id',
              foreignField: 'packageId',
              as: 'ratingAndReview',
            },
          },
        ])
        .skip(skip)
        .limit(limit),
      this._packageModel.countDocuments({
        agencyId: new Types.ObjectId(agencyId),
      }),
    ]);

    return { packages, totalCount };
  }

  async findOfferPackages(): Promise<any[]> {
    return this._packageModel.aggregate([
      { $match: { offerId: { $ne: null }, isActive: true } },
      {
        $lookup: {
          from: 'offers',
          localField: 'offerId',
          foreignField: '_id',
          as: 'offerId',
        },
      },
      { $unwind: '$offerId' },
      {
        $lookup: {
          from: 'reviewforpackages',
          localField: '_id',
          foreignField: 'packageId',
          as: 'ratingAndReview',
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $lookup: {
          from: 'agencies',
          localField: 'agencyId',
          foreignField: '_id',
          as: 'agency',
        },
      },
      { $unwind: '$agency' },
    ]);
  }

  async searchPackagesByAgency(
    agencyId: string,
    searchText: string,
  ): Promise<PackageDocument[]> {
    const query = {
      agencyId: new Types.ObjectId(agencyId),
      $or: [
        { name: { $regex: searchText, $options: 'i' } },
        { country: { $regex: searchText, $options: 'i' } },
        { description: { $regex: searchText, $options: 'i' } },
      ],
    };

    return this._packageModel.find(query).populate('category').exec();
  }

  async updatePackageStatus(
    packageId: string,
    isActive: boolean,
  ): Promise<boolean> {
    const result = await this._packageModel.updateOne(
      { _id: new Types.ObjectId(packageId) },
      { $set: { isActive } },
    );
    return result.modifiedCount > 0;
  }

  async findTopBookedPackages(): Promise<any[]> {
    return this._packageModel.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'agencies',
          localField: 'agencyId',
          foreignField: '_id',
          as: 'agency',
          pipeline: [{ $project: { _id: 0, name: 1 } }],
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryId',
          pipeline: [{ $project: { _id: 0, name: 1 } }],
        },
      },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'package_id',
          as: 'bookings',
          pipeline: [{ $project: { _id: 1 } }],
        },
      },
      {
        $lookup: {
          from: 'reviewforpackages',
          localField: '_id',
          foreignField: 'packageId',
          as: 'ratingAndReview',
        },
      },
      {
        $addFields: {
          bookingsCount: { $size: '$bookings' },
        },
      },
      { $match: { bookingsCount: { $gt: 0 } } },
      {
        $sort: { bookingsCount: -1 },
      },
      {
        $limit: 4,
      },
    ]);
  }

  async savePackageChanges(
    packageId: string,
    updateData: Partial<PackageDocument>,
  ): Promise<boolean> {
    const result = await this._packageModel.updateOne(
      { _id: new Types.ObjectId(packageId) },
      { $set: updateData },
    );
    return result.modifiedCount > 0;
  }
}
