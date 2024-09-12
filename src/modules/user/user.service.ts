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

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Otp.name) private OtpModel: Model<Otp>,
  ) {}

  async createUser(res: Response, userData: CreateUserDto) {
    try {
      const existingUser = await this.userModel
        .findOne({ email: userData.email })
        .exec();
      if (existingUser) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({ message: 'User with this email already exists' });
      }
      const saltRound = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRound);
      const createdUser = new this.userModel({
        ...userData,
        password: hashedPassword,
        profile: {
          firstName: userData.firstName,
          secondName: userData.secondName,
          profilePicture: userData.profilePicture,
          phone: userData.phone,
          address: userData.address,
          preferences: userData.preferences,
        },
      });

      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log('Generated OTP:', otp);
      const subject = 'Verification Mail from "TRAVEL"';

      await Promise.all([
        mailsenderFunc(userData.email, subject, 'otp', { otp }),
        new this.OtpModel({ email: userData.email, otp }).save(),
        createdUser.save(),
      ])
        .then(() => {
          return res.status(HttpStatus.CREATED).json({
            message: 'User Created and OTP sent to email',
            email: userData.email,
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
      if (!user) {
        return null;
      }
      return {
        email: user.email,
        password: user.password,
        userId: user._id,
        isVerified: user.is_Verified,
      };
    } catch (error) {
      console.error('Error occurred while fetching user:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
