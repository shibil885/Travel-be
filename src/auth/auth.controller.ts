import {
  Body,
  Controller,
  ForbiddenException,
  HttpStatus,
  NotAcceptableException,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginUserDto } from 'src/common/dtos/loginUser.dto';
import { AuthService } from './auth.service';
import { LoginAgencyDto } from 'src/common/dtos/loginAgency.dto';
import { AdminDto } from 'src/common/dtos/admin.dto';
import { ErrorMessages } from 'src/common/enum/error.enum';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('validate-token')
  async validateToken(@Req() req: Request, @Res() res: Response) {
    const tokenToValidate = req.cookies['access_token'];
    if (!tokenToValidate) {
      return res.status(HttpStatus.OK).json({
        success: false,
        message: ErrorMessages.TOKEN_EXPIRED,
        valid: false,
        role: '',
      });
    }
    const response = await this.authService.validateToken(tokenToValidate);
    if (response.valid) {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Token validated',
        role: response.role,
        valid: response.valid,
      });
    } else {
      return res.status(HttpStatus.OK).json({
        success: false,
        message: ErrorMessages.TOKEN_EXPIRED,
        valid: false,
        role: response.role,
      });
    }
  }

  @Post('refresh')
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      return res.status(HttpStatus.OK).json({
        success: false,
        message: ErrorMessages.TOKEN_EXPIRED,
        role: '',
        isRefreshed: false,
      });
    }
    const response = await this.authService.refreshToken(refreshToken);
    if (!response) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: ErrorMessages.TOKEN_EXPIRED,
        isRefreshed: false,
        role: response.role,
      });
    }

    res.cookie('access_token', response.access_token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });
    res.cookie('refresh_token', response.refresh_token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Access token refreshed successfully',
      role: response.role,
      isRefreshed: true,
    });
  }

  @Post('user')
  async signIn(@Res() res: Response, @Body() userData: LoginUserDto) {
    try {
      const response = await this.authService.signIn(userData);
      res.cookie('access_token', response.token, {
        httpOnly: true,
        sameSite: 'strict',
      });

      res.cookie('refresh_token', response.refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
      });
      return res.status(200).json({
        user: response.user,
        sucess: response.success,
        message: response.message,
        access_token: response.token,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(401).json({ message: error.message });
      } else if (error instanceof NotAcceptableException) {
        return res.status(HttpStatus.NOT_ACCEPTABLE).json({
          message: 'We sent an otp to your email account',
          success: false,
          warning: true,
          user: error.getResponse(),
        });
      } else if (error instanceof ForbiddenException) {
        return res.status(HttpStatus.FORBIDDEN).json({
          message: error.message,
          success: false,
          user: null,
        });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Post('agency')
  async agencySignIn(@Res() res: Response, @Body() agencyData: LoginAgencyDto) {
    try {
      const response = await this.authService.agencySignIn(agencyData);
      res.cookie('access_token', response.token, {
        httpOnly: true,
        sameSite: 'strict',
      });
      res.cookie('refresh_token', response.refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
      });
      return res.status(HttpStatus.OK).json({
        agency: response.agency,
        success: response.success,
        message: response.message,
        access_token: response.token,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(401).json({ message: 'Invalid email or password' });
      } else if (error instanceof NotAcceptableException) {
        return res.status(HttpStatus.NOT_ACCEPTABLE).json({
          message: 'We sent an OTP to your email account',
          success: false,
          warning: true,
          agency: error,
        });
      } else if (error instanceof ForbiddenException) {
        return res.status(HttpStatus.FORBIDDEN).json({
          message: error.message,
          success: false,
          user: null,
        });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Post('admin')
  async adminSignIn(@Res() res: Response, @Body() adminData: AdminDto) {
    try {
      const response = await this.authService.adminSignIn(adminData);
      res.cookie('access_token', response.token, {
        httpOnly: true,
        sameSite: 'strict',
      });
      res.cookie('refresh_token', response.refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
      });
      return res.status(HttpStatus.OK).json({
        admin: response.admin,
        access_token: response.token,
        message: response.message,
        success: response.success,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Invalid email or password' });
      }
    }
  }
}
