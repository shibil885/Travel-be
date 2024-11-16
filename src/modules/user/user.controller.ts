import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { NotFoundError } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from 'src/common/dtos/updateUser.dto';
import { ChangePasswordDto } from 'src/common/dtos/changePassword.dto';
import { ErrorMessages } from 'src/common/enum/error.enum';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('getPackages')
  async getPackages(
    @Res() res: Response,
    @Query('currentPage') currentPge: number,
    @Query('limit') limit: number,
  ) {
    try {
      const packages = await this.userService.findPackages(currentPge, limit);
      return res.status(HttpStatus.OK).json({
        message: 'List of Packages',
        success: true,
        packages: packages.packages,
        packagesCount: packages.packagesCount,
        currentPage: packages.currentPage,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: '',
          success: false,
          error: error.message,
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: '',
        success: false,
        error: error.message,
      });
    }
  }

  @Get('package/:id')
  async getSinglePackage(@Res() res: Response, @Param('id') id: string) {
    try {
      const fetchedPackage = await this.userService.getSinglePackage(id);
      return res
        .status(HttpStatus.OK)
        .json({ success: true, package: fetchedPackage });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: error.message, success: false });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message, success: false });
    }
  }

  @Post('signup')
  createUser(@Res() res: Response, @Body() userData) {
    return this.userService.createUser(res, userData);
  }

  @Post('isExistingMail')
  findEmail(@Res() res: Response, @Body() body) {
    return this.userService.findEmail(res, body.email);
  }

  @Get('details')
  async getUserDetail(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.userService.findOne(req['user']['email']);
      if (result)
        return res.status(HttpStatus.OK).json({ success: true, user: result });
      else throw new NotFoundException('User not found');
    } catch (error) {
      if (error instanceof NotFoundException)
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, user: null, message: error.message });
      else
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, user: null, message: error.message });
    }
  }

  @Patch('profileImage-update')
  @UseInterceptors(FileInterceptor('profileImg'))
  async uploadProfileImage(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const response = await this.userService.upoloadUserProfileImage(
      req['user']['sub'],
      image,
    );
    if (response) {
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: 'Profile image uploaded' });
    }
    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: 'Profile image uploaded' });
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

  @Patch('update-userProfile')
  async updateUserProfile(
    @Req() req: Request,
    @Res() res: Response,
    @Body() userData: UpdateUserDto,
  ) {
    try {
      const response = await this.userService.updateUserProfile(
        req.user['sub'],
        userData,
      );
      if (response) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Profile updated successfully!' });
      }
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Patch('changePassword')
  async changePassword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() passworData: ChangePasswordDto,
  ) {
    try {
      const response = await this.userService.changePassword(
        req['user']['sub'],
        passworData,
      );
      if (response) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Passwor updated' });
      }
      throw new InternalServerErrorException(
        ErrorMessages.SOMETHING_WENT_WRONG,
      );
    } catch (error) {
      if (error instanceof NotFoundError)
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      else if (error instanceof ConflictException)
        return res
          .status(HttpStatus.CONFLICT)
          .json({ success: false, message: error.message });
      else
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: error.message });
    }
  }
}
