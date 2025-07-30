// import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
// import { Response } from 'express';
// import { OtpDto } from 'src/common/dtos/otp.dto';
// import { OtpService } from './otp.service';
// import { NotificationService } from '../notification/notification.service';

// @Controller('otp')
// export class OtpController {
//   constructor(
//     private otpService: OtpService,
//     private notificationService: NotificationService,
//   ) {}
//   @Post('user')
//   async userOtpSubmission(@Res() res: Response, @Body() otpdata) {
//     const response = await this.otpService.userOtpSubmission(otpdata);
//     if (response.success) {
//       res.cookie('access_token', response.accessToken, {
//         httpOnly: true,
//         sameSite: 'strict',
//         secure: true,
//       });
//       res.cookie('refresh_token', response.refreshToken, {
//         httpOnly: true,
//         sameSite: 'strict',
//         secure: true,
//       });

//       return res.status(HttpStatus.OK).json({
//         message: response.message,
//         user: response.user,
//         success: response.success,
//         token: response.accessToken,
//       });
//     } else {
//       return res.status(HttpStatus.NOT_ACCEPTABLE).json({
//         message: response.message,
//         success: response.success,
//       });
//     }
//   }

//   @Post('agency')
//   async agencyOtpSubmission(@Res() res: Response, @Body() otpdata: OtpDto) {
//     const response = await this.otpService.agencyOtpSubmission(otpdata);
//     if (response.success) {
//       await this.notificationService.agencyRegistration(
//         response.agency.name,
//         response.agency.email,
//         response.agency.id,
//       );
//       res.cookie('access_token', response.accessToken, {
//         httpOnly: true,
//         sameSite: 'strict',
//         secure: true,
//       });
//       res.cookie('refresh_token', response.refreshToken, {
//         httpOnly: true,
//         sameSite: 'strict',
//         secure: true,
//       });
//       return res.status(HttpStatus.OK).json({
//         message: response.message,
//         agency: response.agency,
//         success: response.success,
//         token: response.accessToken,
//       });
//     } else {
//       return res.status(HttpStatus.NOT_ACCEPTABLE).json({
//         message: response.message,
//         success: response.success,
//       });
//     }
//   }

//   @Post('resend')
//   resentOtp(@Res() res: Response, @Body() otpData) {
//     return this.otpService.resendOtp(res, otpData);
//   }
//   @Post('resendSubmission')
//   resentOtpSubmit(@Res() res: Response, @Body() otpData: OtpDto) {
//     return this.otpService.resentOtpSubmit(res, otpData);
//   }
// }

// src/modules/otp/otp.controller.ts
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { OtpService } from './otp.service';
import { NotificationService } from '../notification/notification.service';
import {
  ResponseMessage,
  ApiResponse,
} from 'src/common/decorators/response.decorator';
import { UserOtpVerifyDto } from 'src/common/dtos/user-otp.dto';
import { AgencyOtpVerifyDto } from 'src/common/dtos/agency-otp.dto';
import { ResendOtpDto } from 'src/common/dtos/resend-otp.dto';
import { VerifyOtpDto } from 'src/common/dtos/verify-otp.dto';
import {
  AgencySuccessMessages,
  OTPSuccessMessages,
  UserSuccessMessages,
} from 'src/common/constants/messages';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly _otpService: OtpService,
    @Inject('NotificationService')
    private readonly _notificationService: NotificationService,
  ) {}

  @Post('verify/user')
  @ResponseMessage(UserSuccessMessages.USER_VERIFIED)
  async verifyUserOtp(
    @Body() userOtpData: UserOtpVerifyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this._otpService.verifyUserOtp(userOtpData);
    this._setAuthCookies(res, result.tokens);

    return {
      message: 'User OTP verified and authenticated successfully',
      user: result.user,
      token: result.tokens.accessToken,
    };
  }

  @Post('verify/agency')
  @ResponseMessage(AgencySuccessMessages.AGENCY_VERIFIED)
  async verifyAgencyOtp(
    @Body() agencyOtpData: AgencyOtpVerifyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this._otpService.verifyAgencyOtp(agencyOtpData);

    await this._notificationService.agencyRegistration(
      result.agency.name,
      result.agency.email,
      result.agency.id.toString(),
    );

    this._setAuthCookies(res, result.tokens);

    return {
      message: 'Agency OTP verified and authenticated successfully',
      agency: result.agency,
      token: result.tokens.accessToken,
    };
  }

  @Post('resend')
  @ApiResponse(OTPSuccessMessages.OTP_RESEND, HttpStatus.CREATED)
  async resendOtp(@Body() resendOtpData: ResendOtpDto) {
    return await this._otpService.resendOtp(resendOtpData);
  }

  @Post('verify/resend')
  @ResponseMessage('Resent OTP verified successfully')
  async verifyResendOtp(@Body() otpData: VerifyOtpDto) {
    return await this._otpService.verifyResendOtp(otpData);
  }

  private _setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };

    res.cookie('access_token', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
