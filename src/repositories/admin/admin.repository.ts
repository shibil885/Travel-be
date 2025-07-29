import { FilterQuery } from 'mongoose';
import { AdminDocument } from 'src/modules/admin/schema/admin.schema';
import { AgencyDocument } from 'src/modules/agency/schema/agency.schema';

export interface IAdminRepository {
  findOne(filter: FilterQuery<AdminDocument>): Promise<AdminDocument | null>;
  findAllAgenciesWithpaginationAndFilter(
    limit: number,
    skip: number,
  ): Promise<AgencyDocument[]>;
  countAllAgenciesWithFilter(): Promise<number>;
}
