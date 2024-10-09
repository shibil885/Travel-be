import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
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
import { Package, Packages } from '../package/schema/package.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Otp.name) private OtpModel: Model<Otp>,
    @InjectModel(Agency.name) private AgencyModel: Model<Agency>,
    @InjectModel(Packages.name) private PackageModel: Model<Packages>,
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
      const user = await this.userModel.findOne({ email });
      if (!user) return null;
      return user;
    } catch (error) {
      console.error('Error occurred while fetching user:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
  async findPackages(): Promise<Package[]> {
    const agencies = await this.PackageModel.find().exec();
    console.log(agencies);
    const allPackages = agencies.flatMap((agency) => agency.packages);
    console.log('dataaaaaa', allPackages);
    return allPackages;
  }
}
