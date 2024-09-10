import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { OtpDto } from 'src/common/dtos/otp.dto';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}
  @Post('submit')
  otpSubmission(@Res() res: Response, @Body() otpdata: OtpDto) {
    return this.otpService.otpSubmission(res, otpdata);
  }
  @Post('resend')
  resentOtp(@Res() res: Response, @Body() otpData: OtpDto) {
    return this.otpService.resendOtp(res, otpData);
  }
  @Post('resendSubmission')
  resentOtpSubmit(@Res() res: Response, @Body() otpData: OtpDto) {
    return this.otpService.resentOtpSubmit(res, otpData);
  }
}
