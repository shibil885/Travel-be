import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('getPackages')
  async getPackages(@Res() res: Response) {
    const packages = await this.userService.findPackages();
    return res.status(HttpStatus.OK).json({
      message: 'List of Packages',
      success: true,
      packages,
    });
  }

  @Post('signup')
  createUser(@Res() res: Response, @Body() userData) {
    return this.userService.createUser(res, userData);
  }
  @Post('isExistingMail')
  findEmail(@Res() res: Response, @Body() body) {
    return this.userService.findEmail(res, body.email);
  }
  @Patch('logout')
  userLogout(@Res() res: Response) {
    console.log('Backend: Logout endpoint hit');

    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'strict',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'strict',
    });
    return res.status(200).json({
      message: 'Logout successful',
    });
  }
}
