import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/common/dtos/user.dto';
import { Response } from 'express';
// import { LoginUserDto } from 'src/common/dtos/loginUser.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post('signup')
  createUser(@Res() res: Response, @Body() userData: CreateUserDto) {
    return this.userService.createUser(res, userData);
  }
}
