import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TravelConfirmationStatus } from 'src/common/enum/travelConfirmation.enum';
import { TravelStatus } from 'src/common/enum/travelStatus.enum';
import { Booking } from 'src/modules/booking/schema/booking.schema';
import { Category } from 'src/modules/category/schema/category.schema';
import { Package } from 'src/modules/package/schema/package.schema';

@Injectable()
export class AgencyDashboardService {
  constructor(
    @InjectModel(Package.name) private readonly _PackageModel: Model<Package>,
    @InjectModel(Booking.name) private readonly _BookingModel: Model<Booking>,
    @InjectModel(Category.name)
    private readonly _CatergoryModel: Model<Category>,
  ) {}

  async recentBookings(agencyId: string) {
    const recentBookings = await this._BookingModel
      .find({
        agency_id: new Types.ObjectId(agencyId),
        confirmation: TravelConfirmationStatus.PENDING,
      })
      .populate([
        { path: 'package_id', select: 'name' },
        { path: 'user_id', select: 'profilePicture' },
      ]);
    return recentBookings;
  }

  async getCurrentTravellings(agencyId: string) {
    const currentTravelling = await this._BookingModel
      .find({
        agency_id: new Types.ObjectId(agencyId),
        travel_status: TravelStatus.STARTED,
      })
      .populate([
        { path: 'package_id', select: 'name' },
        { path: 'user_id', select: 'profilePicture' },
      ]);
    return currentTravelling;
  }

  async getStatsCardData(agencyId: string) {
    const packagesCount = await this._PackageModel.countDocuments({
      agencyId: new Types.ObjectId(agencyId),
    });
    const totalBookings = await this._BookingModel.countDocuments({
      agency_id: new Types.ObjectId(agencyId),
    });
    const totalRevenue = await this._BookingModel.aggregate([
      {
        $match: {
          agency_id: new Types.ObjectId(agencyId),
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: '$total_price' } },
        },
      },
    ]);
    return {
      packagesCount,
      totalBookings,
      totalRevenue,
    };
  }
}
