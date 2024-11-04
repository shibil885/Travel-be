import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Package, PackageSchema } from '../package/schema/package.schema';
import { Coupon, CouponSchema } from '../coupon/schema/coupon.schema';
import { BookingService } from '../booking/booking.service';
import { Booking, BookingSchema } from '../booking/schema/booking.schema';
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
  controllers: [PaymentController],
  providers: [PaymentService, BookingService],
})
export class PaymentModule {}
