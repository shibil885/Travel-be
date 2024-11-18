import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Offer } from './schema/offers.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private readonly _OfferModel: Model<Offer>,
  ) {}
  async getAllOffers(agencyId: string, page: number, limit: number) {
    if (!page || !limit) {
      throw new NotAcceptableException(
        !page ? 'Page is not provided' : 'Limit is not provided',
      );
    }
    const skip = (page - 1) * limit;
    const [offers, offerCount] = await Promise.all([
      this._OfferModel.find({ agencyId: agencyId }).skip(skip).limit(limit),
      this._OfferModel.countDocuments({ agencyId: agencyId }),
    ]);
    return {
      offers,
      offerCount,
      page,
    };
  }

  async getApplicablePackages(offerId: string) {
    if (!offerId) throw new NotFoundException('Offer id is not provided');
    const applicablePackages = await this._OfferModel.aggregate([
      { $match: { _id: new Types.ObjectId(offerId) } },
      // { $lookup: { from: 'Packges', localField: applicable_packages } },
    ]);
    return applicablePackages;
  }
}
