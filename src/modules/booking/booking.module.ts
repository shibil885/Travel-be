import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Package, PackageSchema } from '../package/schema/package.schema';
import { Coupon, CouponSchema } from '../coupon/schema/coupon.schema';
import { Booking, BookingSchema } from './schema/booking.schema';
import { WalletModule } from '../wallet/wallet.module';
import { Agency, AgencySchema } from '../agency/schema/agency.schema';
import { AgencyModule } from '../agency/agency.module';
import { AdminModule } from '../admin/admin.module';
import { Admin, AdminSchema } from '../admin/schema/admin.schema';
import { NotificationModule } from '../notification/notification.module';
import {
  Notification,
  NotificationSchema,
} from '../notification/schema/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Package.name, schema: PackageSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: Agency.name, schema: AgencySchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    WalletModule,
    AgencyModule,
    AdminModule,
    NotificationModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
