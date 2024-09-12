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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('user')
  async signIn(@Res() res: Response, @Body() userData: LoginUserDto) {
    try {
      const token = await this.authService.signIn(userData);
      return res.status(200).json(token);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(401).json({ message: 'Invalid email or password' });
      } else if (error instanceof NotAcceptableException) {
        return res.status(HttpStatus.NOT_ACCEPTABLE).json({
          message: 'We sended an otp to your email account',
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
      const token = await this.authService.agencySignIn(AgencyData);
      return res.status(HttpStatus.OK).json(token);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(401).json({ message: 'Invalid email or password' });
      } else if (error instanceof NotAcceptableException) {
        return res.status(HttpStatus.NOT_ACCEPTABLE).json({
          message: 'We sended an otp to your email account',
          email: AgencyData.email,
        });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
