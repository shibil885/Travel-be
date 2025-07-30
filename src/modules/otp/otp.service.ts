// import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Otp } from './schema/otp.schema';
// import { Model } from 'mongoose';
// import { Response } from 'express';
// import { OtpDto } from 'src/common/dtos/otp.dto';
// import { User } from '../user/schemas/user.schema';
// import { mailsenderFunc } from 'src/utils/mailSender.util';
// import { Agency } from '../agency/schema/agency.schema';
// import { AuthService } from 'src/auth/auth.service';

// @Injectable()
// export class OtpService {
//   constructor(
//     @InjectModel(Otp.name) private OtpModel: Model<Otp>,
//     @InjectModel(User.name) private userModel: Model<User>,
//     @InjectModel(Agency.name) private AgencyModel: Model<Agency>,
//     @Inject(forwardRef(() => AuthService))
//     private authService: AuthService,
//   ) {}

//   async userOtpSubmission(otpdata) {
//     try {
//       const isMatched = await this.OtpModel.findOne({
//         email: otpdata.email,
//         otp: parseInt(otpdata.otp),
//       });
//       if (!isMatched) {
//         return {
//           message: 'Invalid Otp',
//           success: false,
//           accessToken: null,
//           refreshToken: null,
//           user: null,
//         };
//       }

//       await this.userModel.updateOne(
//         { email: otpdata.email },
//         { isVerified: true },
//       );
//       const userData = await this.userModel.findOne({ email: otpdata.email });
//       const payload = { sub: userData._id, email: otpdata.email, role: 'user' };
//       const tokens = await this.authService.generateTokens(payload);

//       return {
//         accessToken: tokens.accessToken,
//         refreshToken: tokens.refreshToken,
//         user: userData,
//         success: true,
//         message: 'Otp matched and user verified',
//       };
//     } catch (error) {
//       return {
//         message: 'An error occurred during OTP submission',
//         error,
//         success: false,
//         accessToken: null,
//         refreshToken: null,
//         user: null,
//       };
//     }
//   }

//   async agencyOtpSubmission(otpdata: OtpDto) {
//     const isMatched = await this.OtpModel.findOne({
//       email: otpdata.email,
//       otp: otpdata.otp,
//     });

//     if (!isMatched) {
//       return {
//         success: false,
//         message: 'Invalid Otp',
//         agency: null,
//         accessToken: null,
//         refreshToken: null,
//       };
//     }

//     try {
//       await this.AgencyModel.updateOne(
//         { email: otpdata.email },
//         { isVerified: true },
//       );

//       const agencyData = await this.AgencyModel.findOne({
//         email: otpdata.email,
//       });
//       const payload = {
//         sub: agencyData._id,
//         email: otpdata.email,
//         role: 'agency',
//       };
//       const tokens = await this.authService.generateTokens(payload);

//       return {
//         success: true,
//         message: 'Otp matched and agency verified',
//         agency: agencyData,
//         accessToken: tokens.accessToken,
//         refreshToken: tokens.refreshToken,
//       };
//     } catch (error) {
//       console.log('error occurred during OTP submission :', error);
//       return {
//         success: false,
//         message: 'An error occurred during OTP submission',
//         agency: null,
//         accessToken: null,
//         refreshToken: null,
//       };
//     }
//   }

//   async resendOtp(res: Response, otpData) {
//     try {
//       const otp = Math.floor(1000 + Math.random() * 9000);
//       console.log('Regenerated OTP:', otp);
//       const subject = 'Resend OTP Mail from "TRAVEL"';
//       const mailPromise = mailsenderFunc(otpData.email, subject, 'otp', {
//         otp,
//       });
//       const otpSavePromise = new this.OtpModel({
//         email: otpData.email,
//         otp,
//       }).save();
//       await Promise.all([mailPromise, otpSavePromise]);
//       res.status(HttpStatus.CREATED).json({
//         message: 'Check email for the resent OTP',
//         user: otpData.email,
//       });
//     } catch (error) {
//       console.error('Error during OTP resend:', error);
//       res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
//         message: 'Failed to resend OTP',
//         error: error.message,
//       });
//     }
//   }

//   async resentOtpSubmit(res: Response, otpData: OtpDto) {
//     try {
//       const isMatched = await this.OtpModel.findOne({
//         email: otpData.email,
//         otp: otpData.otp,
//       });
//       if (isMatched) {
//         await this.userModel.updateOne(
//           { email: otpData.email },
//           { is_Verified: true },
//         );
//         return res.status(HttpStatus.OK).json({
//           message: 'OTP verified successfully',
//           email: otpData.email,
//         });
//       } else {
//         return res.status(HttpStatus.NOT_ACCEPTABLE).json({
//           message: 'Invalid OTP',
//           email: otpData.email,
//         });
//       }
//     } catch (error) {
//       console.error('Error during OTP verification:', error);
//       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
//         message: 'Internal Server Error',
//         error: error.message,
//       });
//     }
//   }
// }

import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { mailsenderFunc } from 'src/utils/mailSender.util';
import {
  UserErrorMessages,
  AgencyErrorMessages,
  GeneralErrorMessages,
  OTPSuccessMessages,
  OtpErrorMessages,
} from 'src/common/constants/messages';
import { IOtpRepository } from 'src/repositories/otp/otp.interface';
import { IAgencyRepository } from 'src/repositories/agency/agency.interface';
import { VerifyOtpDto } from 'src/common/dtos/verify-otp.dto';
import { ResendOtpDto } from 'src/common/dtos/resend-otp.dto';
import { IUserRepository } from 'src/repositories/user/user.interface';

@Injectable()
export class OtpService {
  constructor(
    @Inject('IOtpRepository')
    private readonly _otpRepository: IOtpRepository,
    @Inject('IUserRepository')
    private readonly _userRepository: IUserRepository,
    @Inject('IAgencyRepository')
    private readonly _agencyRepository: IAgencyRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly _authService: AuthService,
  ) {}

  async verifyUserOtp(otpData: VerifyOtpDto) {
    try {
      const { email, otp } = otpData;
      const validOtp = await this._otpRepository.findValidOtp(email, otp);

      if (!validOtp) {
        throw new BadRequestException(OtpErrorMessages.INVALID_OTP);
      }

      const updatedUser = await this._userRepository.update(
        await this._getUserIdByEmail(email),
        { isVerified: true },
      );

      if (!updatedUser) {
        throw new NotFoundException(UserErrorMessages.USER_NOT_FOUND);
      }

      const payload = {
        sub: updatedUser._id,
        email: updatedUser.email,
        role: 'user',
      };
      const tokens = await this._authService.generateTokens(payload);

      await this._otpRepository.deleteByEmail(email);

      return {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          isVerified: updatedUser.isVerified,
        },
        tokens,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async verifyAgencyOtp(otpData: VerifyOtpDto) {
    try {
      const { email, otp } = otpData;
      const validOtp = await this._otpRepository.findValidOtp(email, otp);
      if (!validOtp) {
        throw new BadRequestException(OtpErrorMessages.INVALID_OTP);
      }

      const updatedAgency = await this._agencyRepository.update(
        await this._getAgencyIdByEmail(email),
        { isVerified: true },
      );
      console.log(updatedAgency, 'llll');

      if (!updatedAgency) {
        throw new NotFoundException(AgencyErrorMessages.AGENCY_NOT_FOUND);
      }

      const payload = {
        sub: updatedAgency._id,
        email: updatedAgency.email,
        role: 'agency',
      };
      const tokens = await this._authService.generateTokens(payload);
      await this._otpRepository.deleteByEmail(email);

      return {
        agency: {
          id: updatedAgency._id,
          email: updatedAgency.email,
          name: updatedAgency.name,
          isVerified: updatedAgency.isVerified,
        },
        tokens,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async resendOtp(resendOtpData: ResendOtpDto) {
    try {
      const { email } = resendOtpData;

      const [user, agency] = await Promise.all([
        this._userRepository.findOne({ email }),
        this._agencyRepository.findOne({ email: email, isVerified: false }),
      ]);

      if (!user && !agency) {
        throw new NotFoundException('User not found');
      }

      await this._otpRepository.deleteByEmail(email);

      const otp = Math.floor(1000 + Math.random() * 9000);
      const subject = 'Resend OTP Mail from "TRAVEL"';

      await Promise.all([
        this._otpRepository.createOtp(email, otp),
        mailsenderFunc(email, subject, 'otp', { otp }),
      ]);

      return {
        message: 'OTP successfully sent',
        user: user || null,
        agency: agency || null,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  async verifyResendOtp(otpData: VerifyOtpDto) {
    try {
      const { email, otp } = otpData;

      const validOtp = await this._otpRepository.findValidOtp(email, otp);
      if (!validOtp) {
        throw new BadRequestException(OtpErrorMessages.INVALID_OTP);
      }

      const updatedUser = await this._userRepository.update(
        await this._getUserIdByEmail(email),
        { isVerified: true },
      );

      if (!updatedUser) {
        throw new NotFoundException(UserErrorMessages.USER_NOT_FOUND);
      }

      await this._otpRepository.deleteByEmail(email);

      return {
        message: OTPSuccessMessages.OTP_VERIFIED,
        email,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        GeneralErrorMessages.DATABASE_ERROR,
      );
    }
  }

  private async _getUserIdByEmail(email: string): Promise<string> {
    const user = await this._userRepository.findOne({ email });
    if (!user) {
      throw new NotFoundException(UserErrorMessages.USER_NOT_FOUND);
    }
    return user._id.toString();
  }

  private async _getAgencyIdByEmail(email: string): Promise<string> {
    const agency = await this._agencyRepository.findOne({
      email: email,
      isVerified: false,
    });
    if (!agency) {
      throw new NotFoundException(AgencyErrorMessages.AGENCY_NOT_FOUND);
    }
    return agency._id.toString();
  }
}
