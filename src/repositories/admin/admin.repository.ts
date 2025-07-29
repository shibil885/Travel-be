import { AgencyDocument } from 'src/modules/agency/schema/agency.schema';
import { UserDocument } from 'src/modules/user/schemas/user.schema';

export interface IAdminRepository {
  findPaginatedVerifiedAgencies(
    limit: number,
    skip: number,
  ): Promise<AgencyDocument[]>;
  countVerifiedAgencies(): Promise<number>;

  findPaginatedVerifiedUsers(
    limit: number,
    skip: number,
  ): Promise<UserDocument[]>;
  countVerifiedUsers(): Promise<number>;

  updateAgencyById(
    agencyId: string,
    action: boolean,
  ): Promise<AgencyDocument | null>;
  updateUserById(userId: string, action: boolean): Promise<UserDocument | null>;

  confirmAgency(
    agencyId: string,
    action: boolean,
  ): Promise<AgencyDocument | null>;

  findWIthFilter(
    user: 'user' | 'agency',
    filter: Record<string, any>,
  ): Promise<(UserDocument | AgencyDocument)[]>;

  searchUsers(
    userType: 'user' | 'agency',
    searchText: string,
  ): Promise<(UserDocument | AgencyDocument)[]>;
}
