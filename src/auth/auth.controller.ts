import {
  Body,
  Controller,
  HttpStatus,
  NotAcceptableException,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { LoginUserDto } from 'src/common/dtos/loginUser.dto';
import { AuthService } from './auth.service';
import { LoginAgencyDto } from 'src/common/dtos/loginAgency.dto';
import { AdminDto } from 'src/common/dtos/admin.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('user')
  async signIn(@Res() res: Response, @Body() userData: LoginUserDto) {
    try {
      const response = await this.authService.signIn(userData);
      console.log(response);

      return res
        .status(200)
        .json({ token: response.access_token, user: response.user });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(401).json({ message: error.message });
      } else if (error instanceof NotAcceptableException) {
        return res.status(HttpStatus.NOT_ACCEPTABLE).json({
          message: 'We sended an otp to your email account',
          type: 'PENDING OTP',
          email: userData.email,
        });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Post('agency')
  async agencySingnIn(
    @Res() res: Response,
    @Body() AgencyData: LoginAgencyDto,
  ) {
    try {
      const response = await this.authService.agencySignIn(AgencyData);
      console.log(response);
      return res
        .status(HttpStatus.OK)
        .json({ token: response.access_token, agency: response.agency });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(401).json({ message: 'Invalid email or password' });
      } else if (error instanceof NotAcceptableException) {
        return res.status(HttpStatus.NOT_ACCEPTABLE).json({
          message: 'We send an otp to your email account',
          agency: error,
        });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  @Post('admin')
  async adminSignIn(@Res() res: Response, @Body() adminData: AdminDto) {
    try {
      const token = await this.authService.adminSignIn(adminData);
      console.log(token);
      return res.status(HttpStatus.OK).json(token);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Invalid email or password' });
      }
    }
  }
}
