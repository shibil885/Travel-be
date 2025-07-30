import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from './schema/coupon.schema';
import { Package, PackageSchema } from '../package/schema/package.schema';
import { CouponRepository } from './repositories/coupon.repository';
import { PackageRepository } from '../package/repositories/package.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },
      { name: Package.name, schema: PackageSchema },
    ]),
  ],
  controllers: [CouponController],
  providers: [
    CouponService,
    { provide: 'ICouponRepository', useClass: CouponRepository },
    { provide: 'IPackageRepository', useClass: PackageRepository },
  ],
})
export class CouponModule {}
