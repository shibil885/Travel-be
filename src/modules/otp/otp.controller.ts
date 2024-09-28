import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { OtpDto } from 'src/common/dtos/otp.dto';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}
  @Post('user')
  userOtpSubmission(@Res() res: Response, @Body() otpdata) {
    return this.otpService.userOtpSubmission(res, otpdata);
  }
  @Post('agency')
  AgencyOtpSubmission(@Res() res: Response, @Body() Otpdata: OtpDto) {
    console.log(Otpdata);
    return this.otpService.agencyOtpSubmission(res, Otpdata);
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
