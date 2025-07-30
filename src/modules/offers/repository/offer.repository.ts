import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Offer, OfferDocument } from '../schema/offers.schema';
import { BaseRepository } from 'src/repositories/base/base.repository';
import { IOfferRepository } from 'src/repositories/offer/offer.interface';

@Injectable()
export class OfferRepository
  extends BaseRepository<Offer>
  implements IOfferRepository
{
  constructor(
    @InjectModel(Offer.name) private readonly offerModel: Model<Offer>,
  ) {
    super(offerModel);
  }

  async findByTitle(title: string): Promise<Offer | null> {
    return this.offerModel.findOne({ title });
  }

  async existsById(id: string): Promise<boolean> {
    return !!(await this.offerModel.exists({ _id: new Types.ObjectId(id) }));
  }

  async editOfferTitleConflict(id: string, title: string): Promise<boolean> {
    return !!(await this.offerModel.findOne({
      title: title.toLowerCase(),
      _id: { $ne: new Types.ObjectId(id) },
    }));
  }

  async getApplicablePackages(offerId: string): Promise<OfferDocument[]> {
    return this.offerModel.aggregate([
      { $match: { _id: new Types.ObjectId(offerId) } },
      {
        $lookup: {
          from: 'packages',
          localField: 'applicable_packages',
          foreignField: '_id',
          as: 'packages',
        },
      },
      {
        $project: {
          _id: 0,
          packages: { name: 1, price: 1, images: 1, _id: 1 },
        },
      },
    ]);
  }
}
