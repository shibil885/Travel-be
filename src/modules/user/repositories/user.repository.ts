import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/modules/user/schemas/user.schema';
import {
  Package,
  PackageDocument,
} from 'src/modules/package/schema/package.schema';
import { UpdateUserDto } from 'src/common/dtos/updateUser.dto';
import { BaseRepository } from 'src/repositories/base/base.repository';
import { IUserRepository } from 'src/repositories/user/user.interface';

@Injectable()
export class UserRepository
  extends BaseRepository<UserDocument>
  implements IUserRepository
{
  constructor(
    @InjectModel(User.name) private _userModel: Model<UserDocument>,
    @InjectModel(Package.name) private _packageModel: Model<PackageDocument>,
  ) {
    super(_userModel);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.findOne({ email });
  }

  async findVerifiedByEmail(email: string): Promise<UserDocument | null> {
    return this.findOne({ email, isVerified: true });
  }

  async findActiveByEmail(email: string): Promise<UserDocument | null> {
    return this.findOne({ email, isActive: true });
  }

  async updateProfileImage(userId: string, imageUrl: string): Promise<boolean> {
    const result = await this._userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $set: { profilePicture: imageUrl } },
    );
    return result.modifiedCount > 0;
  }

  async updateUserProfile(
    userId: string,
    userData: UpdateUserDto,
  ): Promise<boolean> {
    const result = await this._userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      {
        $set: {
          username: userData.username,
          email: userData.email,
          phone: userData.phone,
        },
      },
    );
    return result.modifiedCount > 0;
  }

  async updatePassword(
    userId: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const result = await this._userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $set: { password: hashedPassword } },
    );
    return result.modifiedCount > 0;
  }

  async findPackagesWithPagination(
    skip: number,
    limit: number,
  ): Promise<{ packages: any[]; totalCount: number }> {
    const [packages, totalCount] = await Promise.all([
      this._packageModel
        .aggregate([
          { $match: { isActive: true } },
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
              from: 'agencies',
              localField: 'agencyId',
              foreignField: '_id',
              as: 'agencyId',
            },
          },
          { $unwind: '$agencyId' },
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            },
          },
          { $unwind: '$category' },
        ])
        .skip(skip)
        .limit(limit),
      this._packageModel.countDocuments({ isActive: true }),
    ]);

    return { packages, totalCount };
  }

  async findSinglePackageById(packageId: string): Promise<any> {
    const packages = await this._packageModel.aggregate([
      { $match: { isActive: true, _id: new Types.ObjectId(packageId) } },
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
          from: 'agencies',
          localField: 'agencyId',
          foreignField: '_id',
          as: 'agencyId',
        },
      },
      { $unwind: '$agencyId' },
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
          from: 'offers',
          localField: 'offerId',
          foreignField: '_id',
          as: 'offerId',
        },
      },
      { $unwind: { path: '$offerId', preserveNullAndEmptyArrays: true } },
    ]);

    return packages.length > 0 ? packages[0] : null;
  }
}
