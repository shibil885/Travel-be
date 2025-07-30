// import {
//   ConflictException,
//   HttpStatus,
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { User } from './schemas/user.schema';
// import { Model, Types } from 'mongoose';
// import { CreateUserDto } from 'src/common/dtos/user.dto';
// import { Response } from 'express';
// import { mailsenderFunc } from 'src/utils/mailSender.util';
// import { Otp } from '../otp/schema/otp.schema';
// import * as bcrypt from 'bcryptjs';
// import { Agency } from '../agency/schema/agency.schema';
// import { Package } from '../package/schema/package.schema';
// import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
// import { UpdateUserDto } from 'src/common/dtos/updateUser.dto';
// import { ChangePasswordDto } from 'src/common/dtos/changePassword.dto';
// import { ErrorMessages } from 'src/common/constants/enum/error.enum';
// import sharp from 'sharp';

// @Injectable()
// export class UserService {
//   constructor(
//     @InjectModel(User.name) private userModel: Model<User>,
//     @InjectModel(Otp.name) private OtpModel: Model<Otp>,
//     @InjectModel(Agency.name) private AgencyModel: Model<Agency>,
//     @InjectModel(Package.name) private PackageModel: Model<Package>,
//     private _cloudinaryService: CloudinaryService,
//   ) {}

//   async findEmail(res: Response, email: string) {
//     try {
//       const isExisting = await this.userModel.findOne({
//         email: email,
//         isVerified: true,
//       });
//       if (isExisting) {
//         return res.status(HttpStatus.OK).json({ isExisting: true });
//       }
//       return res.status(HttpStatus.OK).json({ isExisting: false });
//     } catch (error) {
//       console.log('Error occured while fetching Agency email:', error);
//       throw new InternalServerErrorException();
//     }
//   }

//   async createUser(res: Response, userData: CreateUserDto) {
//     try {
//       const existingUser = await this.userModel
//         .findOne({ email: userData.email })
//         .exec();
//       if (existingUser) {
//         return res.status(HttpStatus.CONFLICT).json({
//           message: 'User with this email already exists',
//           success: false,
//           user: null,
//         });
//       }

//       const saltRound = 10;
//       const hashedPassword = await bcrypt.hash(userData.password, saltRound);
//       const createdUser = new this.userModel({
//         email: userData.email,
//         username: userData.userName,
//         password: hashedPassword,
//         phone: userData.phone,
//         profilePicture: process.env.DEFAULT_PROFILE,
//         preferences: [],
//       });

//       const otp = Math.floor(1000 + Math.random() * 9000);
//       console.log('Generated OTP:', otp);
//       const subject = 'Verification Mail from "TRAVEL"';

//       await Promise.all([
//         mailsenderFunc(userData.email, subject, 'otp', { otp }),
//         new this.OtpModel({ email: userData.email, otp }).save(),
//         createdUser.save(),
//       ])
//         .then(async () => {
//           const user = await this.userModel.findOne({ email: userData.email });
//           console.log(user);
//           return res.status(HttpStatus.CREATED).json({
//             user: user,
//             success: true,
//             message: '',
//           });
//         })
//         .catch((err) => {
//           console.log('Error:', err);
//           throw new InternalServerErrorException();
//         });
//     } catch (error) {
//       console.error('Error during user creation:', error);
//       return res
//         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//         .json({ message: 'Internal Server Error' });
//     }
//   }

//   async findOne(email: string) {
//     try {
//       const user = await this.userModel.findOne({ email, isActive: true });
//       if (!user) return null;
//       return user;
//     } catch (error) {
//       console.error('Error occurred while fetching user:', error);
//       throw new InternalServerErrorException('Internal Server Error');
//     }
//   }

//   async uploadUserProfileImage(
//     userId: string,
//     profileImage: Express.Multer.File,
//   ) {
//     try {
//       const FIXED_WIDTH = 300; // Example: 300px wide
//       const FIXED_HEIGHT = 300; // Example: 300px tall

//       // Resize and crop the image using sharp
//       const processedImageBuffer = await sharp(profileImage.buffer)
//         .resize(FIXED_WIDTH, FIXED_HEIGHT, {
//           fit: 'cover', // Ensures cropping and resizing
//           position: sharp.strategy.entropy, // Focus on the most interesting part of the image
//         })
//         .toBuffer();

//       // Upload the processed image to Cloudinary
//       const imageUrl = await this._cloudinaryService
//         .uploadFileBuffer(
//           processedImageBuffer,
//           profileImage.mimetype, // Ensure the correct MIME type is passed
//         )
//         .then((res) => res.url)
//         .catch((error) => {
//           throw new InternalServerErrorException(error.message);
//         });

//       // Update the user's profile picture URL in the database
//       const updateResult = await this.userModel.updateOne(
//         {
//           _id: new Types.ObjectId(userId),
//         },
//         { $set: { profilePicture: imageUrl } },
//       );

//       return updateResult.modifiedCount > 0 ? true : null;
//     } catch (error) {
//       throw new InternalServerErrorException(error.message);
//     }
//   }

//   async getSinglePackage(id: string) {
//     try {
//       const singlePackage = await this.PackageModel.aggregate([
//         { $match: { isActive: true, _id: new Types.ObjectId(id) } },
//         {
//           $lookup: {
//             from: 'reviewforpackages',
//             localField: '_id',
//             foreignField: 'packageId',
//             as: 'ratingAndReview',
//           },
//         },
//         {
//           $lookup: {
//             from: 'agencies',
//             localField: 'agencyId',
//             foreignField: '_id',
//             as: 'agencyId',
//           },
//         },
//         { $unwind: '$agencyId' },
//         {
//           $lookup: {
//             from: 'categories',
//             localField: 'category',
//             foreignField: '_id',
//             as: 'category',
//           },
//         },
//         { $unwind: '$category' },
//         {
//           $lookup: {
//             from: 'offers',
//             localField: 'offerId',
//             foreignField: '_id',
//             as: 'offerId',
//           },
//         },
//         { $unwind: { path: '$offerId', preserveNullAndEmptyArrays: true } },
//       ]);

//       if (!singlePackage || singlePackage.length === 0) {
//         throw new NotFoundException();
//       }

//       return singlePackage[0];
//     } catch (error) {
//       console.log('Error occurred while fetching single Package:', error);
//       throw new InternalServerErrorException();
//     }
//   }

//   async findPackages(
//     currentPage: number,
//     limit: number,
//   ): Promise<{
//     packages: Package[];
//     packagesCount: number;
//     currentPage: number;
//   }> {
//     try {
//       const skip = Math.ceil(currentPage - 1) * limit;
//       const [packages, packagesCount] = await Promise.all([
//         this.PackageModel.aggregate([
//           { $match: { isActive: true } },
//           {
//             $lookup: {
//               from: 'reviewforpackages',
//               localField: '_id',
//               foreignField: 'packageId',
//               as: 'ratingAndReview',
//             },
//           },
//           {
//             $lookup: {
//               from: 'agencies',
//               localField: 'agencyId',
//               foreignField: '_id',
//               as: 'agencyId',
//             },
//           },
//           { $unwind: '$agencyId' },
//           {
//             $lookup: {
//               from: 'categories',
//               localField: 'category',
//               foreignField: '_id',
//               as: 'category',
//             },
//           },
//           { $unwind: '$category' },
//         ])
//           .skip(skip)
//           .limit(Number(limit)),
//         this.PackageModel.countDocuments({ isActive: true }),
//       ]);
//       if (!packages || packages.length === 0) {
//         throw new NotFoundException();
//       }
//       return {
//         packages,
//         packagesCount,
//         currentPage,
//       };
//     } catch (error) {
//       console.log('error while fetching data from db', error);
//       if (error instanceof NotFoundException) {
//         throw new NotFoundException('No Packages Found');
//       }
//       throw new InternalServerErrorException();
//     }
//   }

//   async updateUserProfile(userId: string, userData: UpdateUserDto) {
//     try {
//       const result = await this.userModel.updateOne(
//         { _id: userId },
//         {
//           $set: {
//             username: userData.username,
//             email: userData.email,
//             phone: userData.phone,
//           },
//         },
//       );
//       return result.modifiedCount > 0 ? true : null;
//     } catch (error) {
//       throw new InternalServerErrorException(error.message);
//     }
//   }

//   async changePassword(userId: string, passwordData: ChangePasswordDto) {
//     const saltRound: number = 10;
//     const { password } = await this.userModel.findById(
//       new Types.ObjectId(userId),
//       { password: 1 },
//     );
//     const isValid = await bcrypt.compare(
//       passwordData.currentpassword,
//       password,
//     );
//     if (!isValid) throw new NotFoundException(ErrorMessages.PASSWORD_NOT_MATCH);
//     else if (passwordData.newpassword !== passwordData.confirmpassword)
//       throw new ConflictException(ErrorMessages.CONFIRM_PASSWOR_NOT_MATCH);
//     const hashedPassword = await bcrypt.hash(
//       passwordData.newpassword,
//       saltRound,
//     );
//     if (!hashedPassword) throw new InternalServerErrorException();

//     const passwordUpdateData = await this.userModel.updateOne(
//       { _id: userId },
//       {
//         $set: { password: hashedPassword },
//       },
//     );
//     return passwordUpdateData.modifiedCount > 0 ? true : null;
//   }

//   async userPasswordRest(userId: string, password: string) {
//     const saltRound = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRound);
//     const updateResult = await this.userModel.updateOne(
//       {
//         _id: new Types.ObjectId(userId),
//       },
//       { $set: { password: hashedPassword } },
//     );
//     return updateResult.modifiedCount > 0 ? true : false;
//   }

//   findUserById(id: string) {
//     return this.userModel.findById(id);
//   }
// }

// src/modules/user/user.service.ts
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/common/dtos/user.dto';
import { UpdateUserDto } from 'src/common/dtos/updateUser.dto';
import { ChangePasswordDto } from 'src/common/dtos/changePassword.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { mailsenderFunc } from 'src/utils/mailSender.util';
import {
  UserErrorMessages,
  PackageErrorMessages,
  GeneralErrorMessages,
} from 'src/common/constants/messages';
import { ErrorMessages } from 'src/common/constants/enum/error.enum';
import * as bcrypt from 'bcryptjs';
import sharp from 'sharp';
import { IUserRepository } from 'src/repositories/user/user.interface';
import { IOtpRepository } from 'src/repositories/otp/otp.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly _userRepository: IUserRepository,
    @Inject('IOtpRepository')
    private readonly _otpRepository: IOtpRepository,
    private readonly _cloudinaryService: CloudinaryService,
  ) {}

  async findEmail(email: string): Promise<{ isExisting: boolean }> {
    const user = await this._userRepository.findOne({
      email: email,
      isVerified: true,
    });
    return { isExisting: !!user };
  }

  async createUser(userData: CreateUserDto) {
    try {
      const existingUser = await this._userRepository.findOne({
        email: userData.email,
        isVerified: true,
      });

      if (existingUser) {
        throw new ConflictException(UserErrorMessages.USER_ALREADY_EXISTS);
      }

      const saltRound = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRound);

      const userToCreate = {
        email: userData.email,
        username: userData.userName,
        password: hashedPassword,
        phone: userData.phone,
        profilePicture: process.env.DEFAULT_PROFILE,
        preferences: [],
      };

      const otp = Math.floor(1000 + Math.random() * 9000);
      const subject = 'Verification Mail from "TRAVEL"';

      await Promise.all([
        this._userRepository.create(userToCreate),
        this._otpRepository.createOtp(userData.email, otp),
        mailsenderFunc(userData.email, subject, 'otp', { otp }),
      ]);

      const createdUser = await this._userRepository.findByEmail(
        userData.email,
      );

      return { user: createdUser };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this._userRepository.findActiveByEmail(email);

      if (!user) {
        throw new NotFoundException(UserErrorMessages.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async findUserById(userId: string) {
    try {
      const user = await this._userRepository.findById(userId);

      if (!user) {
        throw new NotFoundException(UserErrorMessages.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async uploadUserProfileImage(
    userId: string,
    profileImage: Express.Multer.File,
  ): Promise<void> {
    try {
      const FIXED_WIDTH = 300;
      const FIXED_HEIGHT = 300;

      // Process image
      const processedImageBuffer = await sharp(profileImage.buffer)
        .resize(FIXED_WIDTH, FIXED_HEIGHT, {
          fit: 'cover',
          position: sharp.strategy.entropy,
        })
        .toBuffer();

      // Upload to Cloudinary
      const uploadResult = await this._cloudinaryService.uploadFileBuffer(
        processedImageBuffer,
        profileImage.mimetype,
      );

      // Update user profile picture
      const updateSuccess = await this._userRepository.updateProfileImage(
        userId,
        uploadResult.url,
      );

      if (!updateSuccess) {
        throw new InternalServerErrorException(
          UserErrorMessages.PROFILE_PICTURE_UPLOAD_FAILED,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        UserErrorMessages.PROFILE_PICTURE_UPLOAD_FAILED,
      );
    }
  }

  async getSinglePackage(packageId: string) {
    try {
      const packageData =
        await this._userRepository.findSinglePackageById(packageId);

      if (!packageData) {
        throw new NotFoundException(PackageErrorMessages.PACKAGE_NOT_FOUND);
      }

      return { package: packageData };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async findPackages(currentPage: number, limit: number) {
    try {
      const skip = (currentPage - 1) * limit;

      const { packages, totalCount } =
        await this._userRepository.findPackagesWithPagination(skip, limit);

      if (!packages || packages.length === 0) {
        throw new NotFoundException(PackageErrorMessages.PACKAGE_NOT_FOUND);
      }

      return {
        packages,
        packagesCount: totalCount,
        currentPage,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async updateUserProfile(
    userId: string,
    userData: UpdateUserDto,
  ): Promise<void> {
    try {
      const updateSuccess = await this._userRepository.updateUserProfile(
        userId,
        userData,
      );

      if (!updateSuccess) {
        throw new InternalServerErrorException(
          UserErrorMessages.USER_UPDATE_FAILED,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        UserErrorMessages.USER_UPDATE_FAILED,
      );
    }
  }

  async changePassword(
    userId: string,
    passwordData: ChangePasswordDto,
  ): Promise<void> {
    try {
      const user = await this._userRepository.findById(userId);

      if (!user) {
        throw new NotFoundException(UserErrorMessages.USER_NOT_FOUND);
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        passwordData.currentpassword,
        user.password,
      );

      if (!isValidPassword) {
        throw new NotFoundException(ErrorMessages.PASSWORD_NOT_MATCH);
      }

      // Check if new passwords match
      if (passwordData.newpassword !== passwordData.confirmpassword) {
        throw new ConflictException(ErrorMessages.CONFIRM_PASSWOR_NOT_MATCH);
      }

      // Hash new password
      const saltRound = 10;
      const hashedPassword = await bcrypt.hash(
        passwordData.newpassword,
        saltRound,
      );

      // Update password
      const updateSuccess = await this._userRepository.updatePassword(
        userId,
        hashedPassword,
      );

      if (!updateSuccess) {
        throw new InternalServerErrorException(
          UserErrorMessages.PASSWORD_UPDATE_FAILED,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        UserErrorMessages.PASSWORD_UPDATE_FAILED,
      );
    }
  }

  async resetUserPassword(userId: string, password: string): Promise<boolean> {
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);
    return await this._userRepository.updatePassword(userId, hashedPassword);
  }
}
