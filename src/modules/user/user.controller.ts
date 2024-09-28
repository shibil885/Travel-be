import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post('signup')
  createUser(@Res() res: Response, @Body() userData) {
    return this.userService.createUser(res, userData);
  }
  @Post('isExistingMail')
  findEmail(@Res() res: Response, @Body() body) {
    return this.userService.findEmail(res, body.email);
  }
}
