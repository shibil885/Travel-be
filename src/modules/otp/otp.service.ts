import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from './schema/otp.schema';
import { Model } from 'mongoose';
import { Response } from 'express';
import { OtpDto } from 'src/common/dtos/otp.dto';
import { User } from '../user/schemas/user.schema';
import { mailsenderFunc } from 'src/utils/mailSender.util';
import { Agency } from '../agency/schema/agency.schema';
import { Packages } from '../package/schema/package.schema';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private OtpModel: Model<Otp>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Agency.name) private AgencyModel: Model<Agency>,
    @InjectModel(Packages.name) private PackagesModel: Model<Packages>,
  ) {}

  async userOtpSubmission(res: Response, otpdata: OtpDto) {
    const isMatched = await this.OtpModel.findOne({
      email: otpdata.email,
      otp: otpdata.otp,
    });
    if (!isMatched) {
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ Message: 'Invalid Otp', email: otpdata.email });
    }
    try {
      await this.userModel.updateOne(
        { email: otpdata.email },
        { is_Verified: true },
      );

      return res
        .status(HttpStatus.OK)
        .json({ Message: 'OTP verified successfully', email: otpdata.email });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ Message: 'An error occurred during OTP submission', error });
    }
  }

  async agencyOtpSubmission(res: Response, otpdata: OtpDto) {
    const isMatched = await this.OtpModel.findOne({
      email: otpdata.email,
      otp: otpdata.otp,
    });
    if (!isMatched) {
      return res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({ Message: 'Invalid Otp', email: otpdata.email });
    }
    try {
      await this.AgencyModel.updateOne(
        { 'contact.email': otpdata.email },
        { isVerified: true },
      );
      const createdAgency = await this.AgencyModel.findOne({
        'contact.email': otpdata.email,
      });
      await new this.PackagesModel({
        agencyId: createdAgency._id,
        packages: [],
      }).save();
      return res
        .status(HttpStatus.OK)
        .json({ Message: 'OTP verified successfully', email: otpdata.email });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ Message: 'An error occurred during OTP submission', error });
    }
  }

  async resendOtp(res: Response, otpData: OtpDto) {
    try {
      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log('Regenerated OTP:', otp);
      const subject = 'Resend OTP Mail from "TRAVEL"';
      const mailPromise = mailsenderFunc(otpData.email, subject, 'otp', {
        otp,
      });
      const otpSavePromise = new this.OtpModel({
        email: otpData.email,
        otp,
      }).save();
      await Promise.all([mailPromise, otpSavePromise]);
      res.status(HttpStatus.CREATED).json({
        message: 'Check email for the resent OTP',
        email: otpData.email,
      });
    } catch (error) {
      console.error('Error during OTP resend:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to resend OTP',
        error: error.message,
      });
    }
  }

  async resentOtpSubmit(res: Response, otpData: OtpDto) {
    try {
      const isMatched = await this.OtpModel.findOne({
        email: otpData.email,
        otp: otpData.otp,
      });
      if (isMatched) {
        await this.userModel.updateOne(
          { email: otpData.email },
          { is_Verified: true },
        );
        return res.status(HttpStatus.OK).json({
          message: 'OTP verified successfully',
          email: otpData.email,
        });
      } else {
        return res.status(HttpStatus.NOT_ACCEPTABLE).json({
          message: 'Invalid OTP',
          email: otpData.email,
        });
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
}
