import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from './schema/offers.schema';
import { Package, PackageSchema } from '../package/schema/package.schema';
import { PackageRepository } from '../package/repositories/package.repository';
import { OfferRepository } from './repository/offer.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Offer.name, schema: OfferSchema },
      { name: Package.name, schema: PackageSchema },
    ]),
  ],
  providers: [
    OffersService,
    { provide: 'IPackageRepository', useClass: PackageRepository },
    { provide: 'IOfferRepository', useClass: OfferRepository },
  ],
  controllers: [OffersController],
})
export class OffersModule {}
