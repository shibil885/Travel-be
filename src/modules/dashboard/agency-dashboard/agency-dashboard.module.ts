import { Module } from '@nestjs/common';
import { AgencyDashboardService } from './agency-dashboard.service';
import { AgencyDashboardController } from './agency-dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Package,
  PackageSchema,
} from 'src/modules/package/schema/package.schema';
import {
  Booking,
  BookingSchema,
} from 'src/modules/booking/schema/booking.schema';
import {
  Category,
  CategorySchema,
} from 'src/modules/category/schema/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Package.name, schema: PackageSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [AgencyDashboardService],
  controllers: [AgencyDashboardController],
})
export class AgencyDashboardModule {}
