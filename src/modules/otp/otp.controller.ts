import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { OtpDto } from 'src/common/dtos/otp.dto';
import { OtpService } from './otp.service';
import { NotificationService } from '../notification/notification.service';

@Controller('otp')
export class OtpController {
  constructor(
    private otpService: OtpService,
    private notificationService: NotificationService,
  ) {}
  @Post('user')
  async userOtpSubmission(@Res() res: Response, @Body() otpdata) {
    const response = await this.otpService.userOtpSubmission(otpdata);
    if (response.success) {
      res.cookie('access_token', response.accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
      });
      res.cookie('refresh_token', response.refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
      });

      return res.status(HttpStatus.OK).json({
        message: response.message,
        user: response.user,
        success: response.success,
        token: response.accessToken,
      });
    } else {
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({
        message: response.message,
        success: response.success,
      });
    }
  }

  @Post('agency')
  async agencyOtpSubmission(@Res() res: Response, @Body() otpdata: OtpDto) {
    const response = await this.otpService.agencyOtpSubmission(otpdata);
    if (response.success) {
      await this.notificationService.agencyRegistration(
        response.agency.name,
        response.agency.email,
        response.agency.id,
      );
      res.cookie('access_token', response.accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
      });
      res.cookie('refresh_token', response.refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
      });
      return res.status(HttpStatus.OK).json({
        message: response.message,
        agency: response.agency,
        success: response.success,
        token: response.accessToken,
      });
    } else {
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({
        message: response.message,
        success: response.success,
      });
    }
  }

  @Post('resend')
  resentOtp(@Res() res: Response, @Body() otpData) {
    return this.otpService.resendOtp(res, otpData);
  }
  @Post('resendSubmission')
  resentOtpSubmit(@Res() res: Response, @Body() otpData: OtpDto) {
    return this.otpService.resentOtpSubmit(res, otpData);
  }
}
