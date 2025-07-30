// import {
//   Body,
//   ConflictException,
//   Controller,
//   Get,
//   HttpStatus,
//   InternalServerErrorException,
//   NotFoundException,
//   Param,
//   Patch,
//   Post,
//   Query,
//   Req,
//   Res,
//   UploadedFile,
//   UseInterceptors,
// } from '@nestjs/common';
// import { UserService } from './user.service';
// import { Request, Response } from 'express';
// import { NotFoundError } from 'rxjs';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { UpdateUserDto } from 'src/common/dtos/updateUser.dto';
// import { ChangePasswordDto } from 'src/common/dtos/changePassword.dto';
// import { ErrorMessages } from 'src/common/constants/enum/error.enum';

// @Controller('user')
// export class UserController {
//   constructor(private userService: UserService) {}

//   @Get('getPackages')
//   async getPackages(
//     @Res() res: Response,
//     @Query('currentPage') currentPge: number,
//     @Query('limit') limit: number,
//   ) {
//     try {
//       const packages = await this.userService.findPackages(currentPge, limit);
//       return res.status(HttpStatus.OK).json({
//         message: 'List of Packages',
//         success: true,
//         packages: packages.packages,
//         packagesCount: packages.packagesCount,
//         currentPage: packages.currentPage,
//       });
//     } catch (error) {
//       if (error instanceof NotFoundError) {
//         return res.status(HttpStatus.NOT_FOUND).json({
//           message: '',
//           success: false,
//           error: error.message,
//         });
//       }
//       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
//         message: '',
//         success: false,
//         error: error.message,
//       });
//     }
//   }

//   @Get('package/:id')
//   async getSinglePackage(@Res() res: Response, @Param('id') id: string) {
//     try {
//       const fetchedPackage = await this.userService.getSinglePackage(id);
//       return res
//         .status(HttpStatus.OK)
//         .json({ success: true, package: fetchedPackage });
//     } catch (error) {
//       if (error instanceof NotFoundError) {
//         return res
//           .status(HttpStatus.NOT_FOUND)
//           .json({ message: error.message, success: false });
//       }
//       return res
//         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//         .json({ message: error.message, success: false });
//     }
//   }

//   @Post('signup')
//   createUser(@Res() res: Response, @Req() req: Request, @Body() userData) {
//     return this.userService.createUser(res, userData);
//   }

//   @Post('isExistingMail')
//   findEmail(@Res() res: Response, @Body() body) {
//     return this.userService.findEmail(res, body.email);
//   }

//   @Get('details')
//   async getUserDetail(@Req() req: Request, @Res() res: Response) {
//     try {
//       const result = await this.userService.findOne(req['user']['email']);
//       if (result)
//         return res.status(HttpStatus.OK).json({ success: true, user: result });
//       else throw new NotFoundException('User not found');
//     } catch (error) {
//       if (error instanceof NotFoundException)
//         return res
//           .status(HttpStatus.NOT_FOUND)
//           .json({ success: false, user: null, message: error.message });
//       else
//         return res
//           .status(HttpStatus.INTERNAL_SERVER_ERROR)
//           .json({ success: false, user: null, message: error.message });
//     }
//   }

//   @Patch('profileImage-update')
//   @UseInterceptors(FileInterceptor('profileImg'))
//   async uploadProfileImage(
//     @Req() req: Request,
//     @Res() res: Response,
//     @UploadedFile() image: Express.Multer.File,
//   ) {
//     const response = await this.userService.uploadUserProfileImage(
//       req['user']['sub'],
//       image,
//     );
//     if (response) {
//       return res
//         .status(HttpStatus.OK)
//         .json({ success: true, message: 'Profile image uploaded' });
//     }
//     return res
//       .status(HttpStatus.OK)
//       .json({ success: true, message: 'Profile image uploaded' });
//   }

//   @Patch('logout')
//   userLogout(@Res() res: Response) {
//     console.log('Backend: Logout endpoint hit');

//     res.clearCookie('access_token', {
//       httpOnly: true,
//       sameSite: 'strict',
//     });

//     res.clearCookie('refresh_token', {
//       httpOnly: true,
//       sameSite: 'strict',
//     });
//     return res.status(200).json({
//       message: 'Logout successful',
//     });
//   }

//   @Patch('update-userProfile')
//   async updateUserProfile(
//     @Req() req: Request,
//     @Res() res: Response,
//     @Body() userData: UpdateUserDto,
//   ) {
//     try {
//       const response = await this.userService.updateUserProfile(
//         req.user['sub'],
//         userData,
//       );
//       if (response) {
//         return res
//           .status(HttpStatus.OK)
//           .json({ success: true, message: 'Profile updated successfully!' });
//       }
//     } catch (error) {
//       return res
//         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//         .json({ success: false, message: error.message });
//     }
//   }

//   @Patch('changePassword')
//   async changePassword(
//     @Req() req: Request,
//     @Res() res: Response,
//     @Body() passworData: ChangePasswordDto,
//   ) {
//     try {
//       const response = await this.userService.changePassword(
//         req['user']['sub'],
//         passworData,
//       );
//       if (response) {
//         return res
//           .status(HttpStatus.OK)
//           .json({ success: true, message: 'Passwor updated' });
//       }
//       throw new InternalServerErrorException(
//         ErrorMessages.SOMETHING_WENT_WRONG,
//       );
//     } catch (error) {
//       if (error instanceof NotFoundError)
//         return res
//           .status(HttpStatus.NOT_FOUND)
//           .json({ success: false, message: error.message });
//       else if (error instanceof ConflictException)
//         return res
//           .status(HttpStatus.CONFLICT)
//           .json({ success: false, message: error.message });
//       else
//         return res
//           .status(HttpStatus.INTERNAL_SERVER_ERROR)
//           .json({ success: false, message: error.message });
//     }
//   }
// }

// src/modules/user/user.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpStatus,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from 'src/common/dtos/updateUser.dto';
import { ChangePasswordDto } from 'src/common/dtos/changePassword.dto';
import { CreateUserDto } from 'src/common/dtos/user.dto';
import { ApiResponse } from 'src/common/decorators/response.decorator';
import { UserSuccessMessages } from 'src/common/constants/messages';

@Controller('user')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get('packages')
  @ApiResponse('Package list fetched successfully')
  async getPackages(
    @Query('currentPage') currentPage: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this._userService.findPackages(currentPage, limit);
    return {
      packages: result.packages,
      packagesCount: result.packagesCount,
      currentPage: result.currentPage,
    };
  }

  @Get('package/:id')
  @ApiResponse('Package details fetched successfully')
  async getSinglePackage(@Param('id') id: string) {
    const result = await this._userService.getSinglePackage(id);
    return { package: result.package };
  }

  @Post('signup')
  @ApiResponse(UserSuccessMessages.USER_CREATED, HttpStatus.CREATED)
  async createUser(@Body() userData: CreateUserDto) {
    const result = await this._userService.createUser(userData);
    return { user: result.user };
  }

  @Post('check-email')
  @ApiResponse('Email availability checked', HttpStatus.OK)
  async checkEmail(@Body('email') email: string) {
    return await this._userService.findEmail(email);
  }

  @Get('profile')
  @ApiResponse('User profile fetched successfully')
  async getUserProfile(@Req() req: Request) {
    const userEmail = req['user']['email'];
    const user = await this._userService.findUserByEmail(userEmail);
    return { user: user };
  }

  @Patch('profile-image')
  @UseInterceptors(FileInterceptor('profileImg'))
  @ApiResponse(UserSuccessMessages.USER_PROFILE_PICTURE_UPDATED)
  async uploadProfileImage(
    @Req() req: Request,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const userId = req['user']['sub'];
    await this._userService.uploadUserProfileImage(userId, image);
    return {};
  }

  @Patch('logout')
  @ApiResponse(UserSuccessMessages.LOGOUT_SUCCESS)
  async userLogout(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'strict',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'strict',
    });

    return {};
  }

  @Patch('profile')
  @ApiResponse(UserSuccessMessages.USER_UPDATED)
  async updateUserProfile(
    @Req() req: Request,
    @Body() userData: UpdateUserDto,
  ) {
    const userId = req['user']['sub'];
    await this._userService.updateUserProfile(userId, userData);
    return {};
  }

  @Patch('change-password')
  @ApiResponse(UserSuccessMessages.PASSWORD_UPDATED)
  async changePassword(
    @Req() req: Request,
    @Body() passwordData: ChangePasswordDto,
  ) {
    const userId = req['user']['sub'];
    await this._userService.changePassword(userId, passwordData);
    return {};
  }
}
