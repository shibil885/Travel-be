import { UserDocument } from 'src/modules/user/schemas/user.schema';
import { IBaseRepository } from '../base/base.interface';
import { UpdateUserDto } from 'src/common/dtos/updateUser.dto';

export interface IUserRepository extends IBaseRepository<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;

  findVerifiedByEmail(email: string): Promise<UserDocument | null>;

  findActiveByEmail(email: string): Promise<UserDocument | null>;

  updateProfileImage(userId: string, imageUrl: string): Promise<boolean>;

  updateUserProfile(userId: string, userData: UpdateUserDto): Promise<boolean>;

  updatePassword(userId: string, hashedPassword: string): Promise<boolean>;

  findPackagesWithPagination(
    skip: number,
    limit: number,
  ): Promise<{ packages: any[]; totalCount: number }>;

  findSinglePackageById(packageId: string): Promise<any>;
}
