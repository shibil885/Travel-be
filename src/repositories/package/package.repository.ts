import { PackageDocument } from 'src/modules/package/schema/package.schema';
import { IBaseRepository } from '../base/base.interface';

export interface IPackageRepository extends IBaseRepository<PackageDocument> {
  findPackagesByAgencyWithPagination(
    agencyId: string,
    skip: number,
    limit: number,
  ): Promise<{ packages: any[]; totalCount: number }>;

  findOfferPackages(): Promise<any[]>;

  searchPackagesByAgency(
    agencyId: string,
    searchText: string,
  ): Promise<PackageDocument[]>;

  updatePackageStatus(packageId: string, isActive: boolean): Promise<boolean>;

  findTopBookedPackages(): Promise<any[]>;
  findOnePackageWithOffer(id): Promise<PackageDocument>;
  savePackageChanges(
    packageId: string,
    updateData: Partial<PackageDocument>,
  ): Promise<boolean>;
}
