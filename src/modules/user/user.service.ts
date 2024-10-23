import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/common/dtos/user.dto';
import { Response } from 'express';
import { mailsenderFunc } from 'src/utils/mailSender.util';
import { Otp } from '../otp/schema/otp.schema';
import * as bcrypt from 'bcrypt';
import { Agency } from '../agency/schema/agency.schema';
import { Package } from '../package/schema/package.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Otp.name) private OtpModel: Model<Otp>,
    @InjectModel(Agency.name) private AgencyModel: Model<Agency>,
    @InjectModel(Package.name) private PackageModel: Model<Package>,
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
  findUserById(id: string) {
    return this.userModel.findById(id);
  }
}
