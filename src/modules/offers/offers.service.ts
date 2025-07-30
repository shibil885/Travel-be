import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddOfferDto } from 'src/common/dtos/addOffer.dto';
import { IOffer } from 'src/common/interfaces/offer.interface';
import { EditOfferDto } from 'src/common/dtos/editOffer.dto';
import { IOfferRepository } from 'src/repositories/offer/offer.interface';
import { IPackageRepository } from 'src/repositories/package/package.repository';
import { OfferType } from 'src/common/constants/enum/offerType.enum';
import { Types } from 'mongoose';

@Injectable()
export class OffersService {
  constructor(
    @Inject('IOfferRepository')
    private readonly _offerRepository: IOfferRepository,
    @Inject('IPackageRepository')
    private readonly _packageRepository: IPackageRepository,
  ) {}

  async createOffer(agencyId: string, offerData: AddOfferDto) {
    const lowerCaseTitle = offerData.title.toLocaleLowerCase();
    const isExistingOffer = await this._offerRepository.findOne({
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
    if (offerData.discount_type === OfferType.FIXED) {
      offerFields.discount_value = offerData.discount_value;
    } else if (offerData.discount_type === OfferType.PERCENTAGE) {
      offerFields.percentage = offerData.percentage;
    }
    const createdOffer = await this._offerRepository.create({ ...offerFields });
    return createdOffer;
  }

  async editOffer(offerId: string, offerData: EditOfferDto): Promise<boolean> {
    if (!offerData || !offerId) {
      throw new NotFoundException(
        !offerData ? 'Offer data not provided' : 'Offer ID not provided',
      );
    }

    const title = offerData.title.toLowerCase();

    const offerExists = await this._offerRepository.existsById(offerId);
    if (!offerExists) {
      throw new NotFoundException('Offer not found');
    }

    const titleConflict = await this._offerRepository.editOfferTitleConflict(
      offerId,
      title,
    );
    if (titleConflict) {
      throw new ConflictException('Offer title already exists');
    }

    const result = await this._offerRepository.update(offerId, {
      ...offerData,
    });

    if (!result) {
      throw new NotFoundException('Failed to update offer');
    }

    return true;
  }

  async getAllOffers(agencyId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [offers, totalCount] = await Promise.all([
      this._offerRepository.findAllWithPaginationAndFilter(
        { agencyId: new Types.ObjectId(agencyId) },
        skip,
        limit,
      ),
      this._offerRepository.countDocument({}),
    ]);
    return {
      offers,
      totalCount,
      currentPage: page,
    };
  }

  async getOneOffer(offerId: string) {
    if (!offerId) throw new NotFoundException('Offer id is not provided');
    const offer = await this._offerRepository.findOne({
      _id: new Types.ObjectId(offerId),
    });
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async getApplicablePackages(offerId: string) {
    if (!offerId) throw new NotFoundException('Offer id is not provided');
    const offerExists = await this._offerRepository.existsById(offerId);

    if (!offerExists) throw new NotFoundException('Offer not found');

    const applicablePackages =
      await this._offerRepository.getApplicablePackages(offerId);

    return applicablePackages[0];
  }

  async getPackagesForApplyOffer(agencyId: string, offerId: string) {
    if (!offerId) throw new NotFoundException('Offer id not provided');

    const packages = await this._packageRepository.findAll({
      agencyId: new Types.ObjectId(agencyId),
      offerId: null,
    });
    return packages;
  }

  async applyOffer(offerId: string, packageId: string): Promise<boolean> {
    if (!offerId || !packageId) {
      throw new NotFoundException(
        !offerId ? 'Offer ID is not provided' : 'Package ID is not provided',
      );
    }

    const offerObjectId = new Types.ObjectId(offerId);
    const packageObjectId = new Types.ObjectId(packageId);

    const [offerExists, packageExists] = await Promise.all([
      this._offerRepository.existsById(offerId),
      this._packageRepository.findOne({ _id: packageId }),
    ]);

    if (!offerExists) {
      throw new NotFoundException('Offer not found');
    }

    if (!packageExists) {
      throw new NotFoundException('Package not found');
    }

    const [offerUpdateResult, packageUpdateResult] = await Promise.all([
      this._offerRepository.update(offerId, {
        $push: { applicable_packages: packageObjectId },
      }),
      this._packageRepository.update(packageId, {
        $set: { offerId: offerObjectId },
      }),
    ]);

    const success = offerUpdateResult && packageUpdateResult;
    return !!success;
  }

  async removeOffer(offerId: string, packageId: string) {
    if (!offerId) throw new NotFoundException('Offer id not provided');

    const [resultOfOffer, resultOfPackage] = await Promise.all([
      this._offerRepository.update(offerId, {
        $pull: { applicable_packages: new Types.ObjectId(packageId) },
      }),
      this._packageRepository.update(packageId, {
        $set: { offerId: null },
      }),
    ]);
    const success = resultOfOffer && resultOfPackage;
    return !!success;
  }
}
