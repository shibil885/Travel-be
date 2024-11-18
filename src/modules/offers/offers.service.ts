import {
  ConflictException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Offer } from './schema/offers.schema';
import { InjectModel } from '@nestjs/mongoose';
import { AddOfferDto } from 'src/common/dtos/addOffer.dto';
import { DiscountType } from 'src/common/enum/discountType.enum';
import { IOffer } from 'src/common/interfaces/offer.interface';
import { EditOfferDto } from 'src/common/dtos/editOffer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private readonly _OfferModel: Model<Offer>,
  ) {}

  async addOffer(agencyId: string, offerData: AddOfferDto) {
    if (!offerData) {
      throw new NotFoundException('Required fields are not available');
    }
    const lowerCaseTitle = offerData.title.toLocaleLowerCase();
    const isExistingOffer = await this._OfferModel.findOne({
      agencyId: agencyId,
      title: lowerCaseTitle,
    });
    if (isExistingOffer) {
      throw new ConflictException('Offer Title already exist');
    }
    const offerFields: IOffer = {
      title: lowerCaseTitle,
      description: offerData.description,
      discount_type: offerData.discount_type,
      expiry_date: offerData.expiry_date,
      agencyId: new Types.ObjectId(agencyId),
    };
    if (offerData.discount_type === DiscountType.FIXED) {
      offerFields.discount_value = offerData.discount_value;
    } else if (offerData.discount_type === DiscountType.PERCENTAGE) {
      offerFields.percentage = offerData.percentage;
    }
    const createdOffer = await new this._OfferModel(offerFields).save();
    return createdOffer;
  }

  async editOffer(offerId: string, offerData: EditOfferDto) {
    if (!offerData || !offerId)
      throw new NotFoundException(
        !offerData ? 'Offer data not provided' : 'Offer id is not provided',
      );
    const lowerCaseTitle = offerData.title.toLowerCase();
    const parserOfferId = new Types.ObjectId(offerId);
    const [fetchResult] = await this._OfferModel.aggregate([
      {
        $facet: {
          offers: [{ $match: { _id: parserOfferId } }],
          isExisting: [
            {
              $match: {
                title: lowerCaseTitle,
                _id: { $ne: parserOfferId },
              },
            },
          ],
        },
      },
    ]);
    const { offers, isExisting } = fetchResult;
    if (offers.length == 0) {
      throw new NotFoundException('Offer not found');
    } else if (isExisting.length > 0) {
      throw new ConflictException('Offer title already exist');
    } else {
      const updateResult = await this._OfferModel.updateOne(
        {
          _id: parserOfferId,
        },
        offerData,
      );
      return updateResult.modifiedCount > 0;
    }
  }

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
