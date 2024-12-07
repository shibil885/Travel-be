import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
}
