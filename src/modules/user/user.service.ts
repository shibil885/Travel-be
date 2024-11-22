import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from 'src/common/dtos/user.dto';
import { Response } from 'express';
import { mailsenderFunc } from 'src/utils/mailSender.util';
import { Otp } from '../otp/schema/otp.schema';
import * as bcrypt from 'bcrypt';
import { Agency } from '../agency/schema/agency.schema';
import { Package } from '../package/schema/package.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateUserDto } from 'src/common/dtos/updateUser.dto';
import { ChangePasswordDto } from 'src/common/dtos/changePassword.dto';
import { ErrorMessages } from 'src/common/enum/error.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Otp.name) private OtpModel: Model<Otp>,
    @InjectModel(Agency.name) private AgencyModel: Model<Agency>,
    @InjectModel(Package.name) private PackageModel: Model<Package>,
    private _cloudinaryService: CloudinaryService,
  ) {}
  async findEmail(res: Response, email: string) {
    try {
      const isExisting = await this.userModel.findOne({
        email: email,
      });
      if (isExisting) {
        return res.status(HttpStatus.OK).json({ isExisting: true });
      }
      return res.status(HttpStatus.OK).json({ isExisting: false });
    } catch (error) {
      console.log('Error occured while fetching Agency email:', error);
      throw new InternalServerErrorException();
    }
  }

  async createUser(res: Response, userData: CreateUserDto) {
    try {
      const existingUser = await this.userModel
        .findOne({ email: userData.email })
        .exec();
      if (existingUser) {
        return res.status(HttpStatus.CONFLICT).json({
          message: 'User with this email already exists',
          success: false,
          user: null,
        });
      }

      const saltRound = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRound);

      const createdUser = new this.userModel({
        email: userData.email,
        username: userData.userName,
        password: hashedPassword,
        phone: userData.phone,
        profilePicture: process.env.DEFAULT_PROFILE,
        preferences: [],
      });

      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log('Generated OTP:', otp);
      const subject = 'Verification Mail from "TRAVEL"';

      await Promise.all([
        mailsenderFunc(userData.email, subject, 'otp', { otp }),
        new this.OtpModel({ email: userData.email, otp }).save(),
        createdUser.save(),
      ])
        .then(async () => {
          const user = await this.userModel.findOne({ email: userData.email });
          console.log(user);
          return res.status(HttpStatus.CREATED).json({
            user: user,
            success: true,
            message: '',
          });
        })
        .catch((err) => {
          console.log('Error:', err);
          throw new InternalServerErrorException();
        });
    } catch (error) {
      console.error('Error during user creation:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal Server Error' });
    }
  }

  async findOne(email: string) {
    try {
      const user = await this.userModel.findOne({ email, isActive: true });
      if (!user) return null;
      return user;
    } catch (error) {
      console.error('Error occurred while fetching user:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async upoloadUserProfileImage(
    userId: string,
    profileImage: Express.Multer.File,
  ) {
    try {
      const imageUrl = await this._cloudinaryService
        .uploadFile(profileImage)
        .then((res) => {
          return res.url;
        })
        .catch((error) => {
          new InternalServerErrorException(error.message);
        });
      const updateResult = await this.userModel.updateOne(
        {
          _id: new Types.ObjectId(userId),
        },
        { $set: { profilePicture: imageUrl } },
      );
      return updateResult.modifiedCount > 0 ? true : null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getSinglePackage(id: string) {
    try {
      const singlePackage = await this.PackageModel.findOne({
        _id: id,
        isActive: true,
      }).populate(['agencyId', 'category', 'offerId']);
      if (!singlePackage) {
        throw new NotFoundException();
      }
      return singlePackage;
    } catch (error) {
      console.log('error occured while fetch single Packag', error);
      throw new InternalServerErrorException();
    }
  }

  async findPackages(
    currentPage: number,
    limit: number,
  ): Promise<{
    packages: Package[];
    packagesCount: number;
    currentPage: number;
  }> {
    try {
      const skip = Math.ceil(currentPage - 1) * limit;
      const [packages, packagesCount] = await Promise.all([
        this.PackageModel.find({ isActive: true })
          .skip(skip)
          .limit(limit)
          .populate('agencyId')
          .populate('category')
          .exec(),
        this.PackageModel.countDocuments({ isActive: true }),
      ]);
      if (!packages || packages.length === 0) {
        throw new NotFoundException();
      }
      return {
        packages,
        packagesCount,
        currentPage,
      };
    } catch (error) {
      console.log('error while fetching data from db', error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException('No Packages Found');
      }
      throw new InternalServerErrorException();
    }
  }

  async updateUserProfile(userId: string, userData: UpdateUserDto) {
    try {
      const result = await this.userModel.updateOne(
        { _id: userId },
        {
          $set: {
            username: userData.username,
            email: userData.email,
            phone: userData.phone,
          },
        },
      );
      return result.modifiedCount > 0 ? true : null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changePassword(userId: string, passwordData: ChangePasswordDto) {
    const saltRound: number = 10;
    const { password } = await this.userModel.findById(
      new Types.ObjectId(userId),
      { password: 1 },
    );
    const isValid = await bcrypt.compare(
      passwordData.currentpassword,
      password,
    );
    if (!isValid) throw new NotFoundException(ErrorMessages.PASSWORD_NOT_MATCH);
    else if (passwordData.newpassword !== passwordData.confirmpassword)
      throw new ConflictException(ErrorMessages.CONFIRM_PASSWOR_NOT_MATCH);
    const hashedPassword = await bcrypt.hash(
      passwordData.newpassword,
      saltRound,
    );
    if (!hashedPassword) throw new InternalServerErrorException();

    const passwordUpdateData = await this.userModel.updateOne(
      { _id: userId },
      {
        $set: { password: hashedPassword },
      },
    );
    return passwordUpdateData.modifiedCount > 0 ? true : null;
  }

  async userPasswordRest(userId: string, password: string) {
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);
    const updateResult = await this.userModel.updateOne(
      {
        _id: new Types.ObjectId(userId),
      },
      { $set: { password: hashedPassword } },
    );
    return updateResult.modifiedCount > 0 ? true : false;
  }

  findUserById(id: string) {
    return this.userModel.findById(id);
  }
}
