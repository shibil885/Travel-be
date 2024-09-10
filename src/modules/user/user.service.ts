import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/common/dtos/user.dto';
import { Response } from 'express';
import { mailsenderFunc } from 'src/utils/mailSender.util';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(res: Response, userData: CreateUserDto) {
    try {
      const existingUser = await this.userModel
        .findOne({
          email: userData.email,
        })
        .exec();
      if (existingUser) {
        console.log('llllllllllll');
        return res
          .status(HttpStatus.CONFLICT)
          .json({ mes: 'User with this email already exist' });
      }
      const createdUser = new this.userModel({
        ...userData,
        profile: {
          firstName: userData.firstName,
          secondNmae: userData.secondName,
          profilepicture: userData.profilePicture,
          phone: userData.phone,
          address: userData.address,
          preferences: userData.preferences,
        },
      });
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log(otp);
      const subject = 'Verification Mail';
      await mailsenderFunc(userData.email, subject, 'otp', { otp });
      await createdUser.save();
      return res.status(HttpStatus.CREATED).json({
        message: 'Successfully created new User and sended otp',
        status: HttpStatus.CREATED,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal Server Error' });
    }
  }
}
