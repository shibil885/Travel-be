import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from './schema/offers.schema';
import { Package, PackageSchema } from '../package/schema/package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Offer.name, schema: OfferSchema },
      { name: Package.name, schema: PackageSchema },
    ]),
  ],
  providers: [OffersService],
  controllers: [OffersController],
})
export class OffersModule {}
