import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Package, PackageSchema } from '../package/schema/package.schema';
import { Coupon, CouponSchema } from '../coupon/schema/coupon.schema';
import { Booking, BookingSchema } from './schema/booking.schema';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Package.name, schema: PackageSchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
    WalletModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
