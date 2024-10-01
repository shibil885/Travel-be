import {
  Body,
  Controller,
  HttpStatus,
  NotAcceptableException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  // UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginUserDto } from 'src/common/dtos/loginUser.dto';
import { AuthService } from './auth.service';
import { LoginAgencyDto } from 'src/common/dtos/loginAgency.dto';
import { AdminDto } from 'src/common/dtos/admin.dto';
// import { RolesGuard } from './guards/guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('validate-token')
  validateToken(@Body('token') token: string) {
    return this.authService.validateToken(token);
  }

  @Post('validate-token-agency')
  validateTokenAgency(@Body('token') token: string) {
    return this.authService.validateTokenAgency(token);
  }
  @Post('validate-token-admin')
  validateTokenAdmin(@Body('token') token: string) {
    console.log('ooooooooooooooooooooot', token);
    return this.authService.validateTokenAdmin(token);
  }

  @Post('refresh')
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['user_refresh_token'];
    console.log('eeee', req.cookies['user_refresh_token']);
    console.log('ddddd', refreshToken);
    if (!refreshToken) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: 'Refresh token not found',
      });
    }
    const tokens = await this.authService.refreshToken(refreshToken);
    if (!tokens) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }
    res.cookie('user_access_token', tokens.access_token, {
      httpOnly: true,
    });
    res.cookie('user_refresh_token', tokens.refresh_token, {
      httpOnly: true,
    });
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Access token refreshed successfully',
    });
  }
  @Post('agencyRefresh')
  async agencyRefreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['agency_refresh_token'];
    if (!refreshToken) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: 'Refresh token not found',
      });
    }
    const tokens =
      await this.authService.agencyRefreshAccessToken(refreshToken);
    if (!tokens) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }
    res.cookie('agency_access_token', tokens.access_token, {
      httpOnly: true,
    });
    res.cookie('agency_refresh_token', tokens.refresh_token, {
      httpOnly: true,
    });
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Access token refreshed successfully',
    });
  }
  @Post('adminRefresh')
  async adminRefreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['admin_refresh_token'];
    if (!refreshToken) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: 'Refresh token not found',
      });
    }
    const tokens = await this.authService.adminRefreshAccessToken(refreshToken);
    if (!tokens) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }
    res.cookie('admin_access_token', tokens.access_token, {
      httpOnly: true,
    });
    res.cookie('admin_refresh_token', tokens.refresh_token, {
      httpOnly: true,
    });
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Access token refreshed successfully',
    });
  }

  @Post('user')
  async signIn(@Res() res: Response, @Body() userData: LoginUserDto) {
    try {
      const response = await this.authService.signIn(userData);
      console.log(response);
      res.cookie('user_access_token', response.token, {
        httpOnly: true,
      });

      res.cookie('user_refresh_token', response.refreshToken, {
        httpOnly: true,
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
          message: 'We sended an otp to your email account',
          type: 'PENDING OTP',
          email: userData.email,
        });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Post('agency')
  async agencySignIn(@Res() res: Response, @Body() agencyData: LoginAgencyDto) {
    try {
      const response = await this.authService.agencySignIn(agencyData);
      res.cookie('agency_access_token', response.token, {
        httpOnly: true,
      });
      res.cookie('agency_refresh_token', response.refreshToken, {
        httpOnly: true,
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
          agency: error,
        });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Post('admin')
  async adminSignIn(@Res() res: Response, @Body() adminData: AdminDto) {
    try {
      const response = await this.authService.adminSignIn(adminData);
      res.cookie('admin_access_token', response.token, {
        httpOnly: true,
      });
      res.cookie('admin_refresh_token', response.refreshToken, {
        httpOnly: true,
      });
      return res.status(HttpStatus.OK).json({
        admin: response.admin,
        token: response.token,
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
