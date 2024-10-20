import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from './schema/otp.schema';
import { Model } from 'mongoose';
import { Response } from 'express';
import { OtpDto } from 'src/common/dtos/otp.dto';
import { User } from '../user/schemas/user.schema';
import { mailsenderFunc } from 'src/utils/mailSender.util';
import { Agency } from '../agency/schema/agency.schema';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private OtpModel: Model<Otp>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Agency.name) private AgencyModel: Model<Agency>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async userOtpSubmission(otpdata) {
    try {
      console.log('otp data', otpdata);
      const isMatched = await this.OtpModel.findOne({
        email: otpdata.email,
        otp: otpdata.otp,
      });
      if (!isMatched) {
        return {
          message: 'Invalid Otp',
          success: false,
          accessToken: null,
          refreshToken: null,
          user: null,
        };
      }

      await this.userModel.updateOne(
        { email: otpdata.email },
        { isVerified: true },
      );
      const userData = await this.userModel.findOne({ email: otpdata.email });
      const payload = { sub: userData._id, email: otpdata.email, role: 'user' };
      console.log('payload =>', payload);
      const tokens = await this.authService.generateTokens(payload);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: userData,
        success: true,
        message: 'Otp matched and user verified',
      };
    } catch (error) {
      return {
        message: 'An error occurred during OTP submission',
        error,
        success: false,
        accessToken: null,
        refreshToken: null,
        user: null,
      };
    }
  }

  async agencyOtpSubmission(otpdata: OtpDto) {
    const isMatched = await this.OtpModel.findOne({
      email: otpdata.email,
      otp: otpdata.otp,
    });

    if (!isMatched) {
      return {
        success: false,
        message: 'Invalid Otp',
        agency: null,
        accessToken: null,
        refreshToken: null,
      };
    }

    try {
      await this.AgencyModel.updateOne(
        { email: otpdata.email },
        { isVerified: true },
      );

      const agencyData = await this.AgencyModel.findOne({
        email: otpdata.email,
      });
      const payload = {
        sub: agencyData._id,
        email: otpdata.email,
        role: 'agency',
      };
      const tokens = await this.authService.generateTokens(payload);

      return {
        success: true,
        message: 'Otp matched and agency verified',
        agency: agencyData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.log('error occurred during OTP submission :', error);
      return {
        success: false,
        message: 'An error occurred during OTP submission',
        agency: null,
        accessToken: null,
        refreshToken: null,
      };
    }
  }

  async resendOtp(res: Response, otpData) {
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
