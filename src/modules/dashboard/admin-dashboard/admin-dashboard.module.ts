import { Module } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/user/schemas/user.schema';
import { Agency, AgencySchema } from 'src/modules/agency/schema/agency.schema';
import {
  Booking,
  BookingSchema,
} from 'src/modules/booking/schema/booking.schema';
import {
  Package,
  PackageSchema,
} from 'src/modules/package/schema/package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Agency.name, schema: AgencySchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Package.name, schema: PackageSchema },
    ]),
  ],
  providers: [AdminDashboardService],
  controllers: [AdminDashboardController],
})
export class AdminDashboardModule {}
