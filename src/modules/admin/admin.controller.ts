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
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';
import { FilterDataDto } from 'src/common/dtos/filterData.dto';
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('agencies')
  findAllAgencies(@Res() res: Response) {
    console.log('callled');
    return this.adminService.findAllAgencies(res);
  }

  @Get('users')
  findAllUsers(@Res() res: Response) {
    return this.adminService.findAllUsers(res);
  }

  @Patch('changeAgencyStatus/:id')
  changeAgencyStatus(@Param() param, @Res() res: Response, @Body() action) {
    console.log('param', param);
    return this.adminService.changeAgencyStatus(param.id, res, action.status);
  }

  @Patch('changeUserStatus/:id')
  changeUserStatus(@Param() param, @Res() res: Response, @Body() action) {
    return this.adminService.changeUserStatus(param.id, res, action.status);
  }
  @Patch('confirmation/:id')
  confirmation(@Param() param, @Res() res: Response, @Body() action) {
    return this.adminService.confirmation(param.id, res, action.status);
  }
  @Post('filter')
  async getFilteredData(@Query() filterData: FilterDataDto, @Body() user) {
    return this.adminService.getFilteredData(filterData, user.user);
  }
  @Post('searchUsers')
  async searchUsers(@Query() searchText, @Body() user) {
    return this.adminService.searchUsers(searchText.searchText, user.user);
  }
  @Patch('logout')
  async agencyLogout(@Req() req: Request, @Res() res: Response) {
    res.clearCookie('accessToken', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.clearCookie('refreshToken', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.status(HttpStatus.OK).json({
      message: 'Successfully logged out',
      success: true,
    });
  }
}
