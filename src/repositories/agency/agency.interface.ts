import { AgencyDocument } from 'src/modules/agency/schema/agency.schema';
import { IBaseRepository } from '../base/base.interface';

export interface IAgencyRepository extends IBaseRepository<AgencyDocument> {
  findAllAgenciesWithReviews(
    skip: number,
    limit: number,
  ): Promise<AgencyDocument[]>;

  updatePassword(agencyId: string, hashedPassword: string): Promise<boolean>;

  countActiveVerifiedConfirmedAgencies(): Promise<number>;

  findAllActiveVerifiedConfirmedAgencies(
    skip: number,
    limit: number,
  ): Promise<AgencyDocument[]>;

  createAgency(agencyData: {
    name: string;
    email: string;
    password: string;
    place: string;
    phone: number;
    document: string;
  }): Promise<AgencyDocument>;
}
