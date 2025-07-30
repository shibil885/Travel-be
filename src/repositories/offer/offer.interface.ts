import { OfferDocument } from 'src/modules/offers/schema/offers.schema';
import { IBaseRepository } from '../base/base.interface';

export interface IOfferRepository extends IBaseRepository<OfferDocument> {
  findByTitle(title: string): Promise<OfferDocument | null>;
  existsById(id: string): Promise<boolean>;
  editOfferTitleConflict(id: string, title: string): Promise<boolean>;
  getApplicablePackages(offerId: string): Promise<OfferDocument[]>;
}
