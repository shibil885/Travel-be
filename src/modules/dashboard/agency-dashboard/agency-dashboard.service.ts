import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TravelConfirmationStatus } from 'src/common/enum/travelConfirmation.enum';
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
        { path: 'user_id', select: 'username profilePicture' },
      ]);
    return recentBookings;
  }
}
