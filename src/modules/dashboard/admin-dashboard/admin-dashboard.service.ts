import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AgencyFilter } from 'src/common/enum/agency-filter.enum';
import { PackageFilter } from 'src/common/enum/package-filter.enum';
import { TravelStatus } from 'src/common/enum/travelStatus.enum';
import { Agency } from 'src/modules/agency/schema/agency.schema';
import { Booking } from 'src/modules/booking/schema/booking.schema';
import { Package } from 'src/modules/package/schema/package.schema';
import { User } from 'src/modules/user/schemas/user.schema';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(User.name) private _UserModel: Model<User>,
    @InjectModel(Agency.name) private _AgencyModel: Model<Agency>,
    @InjectModel(Package.name) private _PackageModel: Model<Package>,
    @InjectModel(Booking.name) private _BookingModel: Model<Booking>,
  ) {}

  private async _fetchTopRatedAgency() {
    return await this._AgencyModel
      .aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'reviewforagencies',
            localField: '_id',
            foreignField: 'agencyId',
            as: 'ratings',
          },
        },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'agency_id',
            as: 'bookings',
            pipeline: [{ $project: { _id: 1 } }],
          },
        },
      ])
      .sort({ 'ratings.averageRating': -1 })
      .limit(5);
  }

  private async _fetchTopBookedAgency() {
    return this._AgencyModel
      .aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'agency_id',
            as: 'bookings',
            pipeline: [{ $project: { _id: 1 } }],
          },
        },
        {
          $lookup: {
            from: 'reviewforagencies',
            localField: '_id',
            foreignField: 'agencyId',
            as: 'ratings',
            pipeline: [{ $project: { _id: 1 } }],
          },
        },
      ])
      .sort({ bookings: -1 })
      .limit(5);
  }

  private async _fetchNewAgencies() {
    return this._AgencyModel
      .aggregate([
        { $match: { isConfirmed: true } },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'agency_id',
            as: 'bookings',
            pipeline: [{ $project: { _id: 1 } }],
          },
        },
        {
          $lookup: {
            from: 'reviewforagencies',
            localField: '_id',
            foreignField: 'agencyId',
            as: 'ratings',
            pipeline: [{ $project: { _id: 1 } }],
          },
        },
      ])
      .sort({ createdAt: -1 })
      .limit(5);
  }

  private _fetchTopRatedPackages() {
    return this._PackageModel
      .aggregate([
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
            pipeline: [{ $project: { _id: 0 } }],
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
      ])
      .sort({ 'ratingAndReview.averageRating': -1 })
      .limit(5);
  }

  private _fetchTopBookedPackages() {
    return this._PackageModel.aggregate([
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
          bookingsCount: { $size: '$bookings' }, // Add a new field to store the length of the bookings array
        },
      },
      {
        $sort: { bookingsCount: -1 }, // Sort by bookingsCount in descending order
      },
      {
        $limit: 5, // Limit to top 5 packages
      },
    ]);
  }

  async statasCardDetails() {
    const [users, agencies, packages, bookings] = await Promise.all([
      this._UserModel.countDocuments(),
      this._AgencyModel.countDocuments(),
      this._PackageModel.countDocuments(),
      this._BookingModel.countDocuments(),
    ]);
    return { users, agencies, packages, bookings };
  }
  async calculateTotalRevenue(): Promise<number> {
    const result = await this._BookingModel.aggregate([
      {
        $match: {
          travel_status: TravelStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: '$total_price' } },
        },
      },
    ]);

    return result[0]?.totalRevenue || 0;
  }

  async topAgencies(query: AgencyFilter = AgencyFilter.TOP_RATED) {
    try {
      if (query === AgencyFilter.TOP_RATED) {
        return this._fetchTopRatedAgency();
      } else if (query === AgencyFilter.TOP_BOOKED) {
        return this._fetchTopBookedAgency();
      } else if (query === AgencyFilter.NEW_AGENCIES) {
        return this._fetchNewAgencies();
      } else {
        throw new BadRequestException('Invalid filteration');
      }
    } catch (error) {
      throw error;
    }
  }

  async topPackages(query: PackageFilter) {
    if (query === PackageFilter.TOP_RATED) {
      return this._fetchTopRatedPackages();
    } else if (query === PackageFilter.TOP_BOOKED) {
      return this._fetchTopBookedPackages();
    } else {
      throw new BadRequestException('Unidentified filter');
    }
  }
}
