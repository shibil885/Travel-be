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
import { Request, Response } from 'express';
import { FilterDataDto } from 'src/common/dtos/filterData.dto';
import { CreateResponse } from 'src/common/response/createResponse';
import {
  AgencySuccessMessages,
  UserSuccessMessages,
} from 'src/common/constants/messages';
@Controller('admin')
export class AdminController {
  constructor(private _adminService: AdminService) {}

  @Get('agencies')
  async getAllAgencies(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
    @Res() res: Response,
  ) {
    const { agencies, totalAgencies, currentPage } =
      await this._adminService.getPaginatedVerifiedAgencies(page, limit);

    CreateResponse.success(
      res,
      { agencies, totalAgencies, currentPage },
      AgencySuccessMessages.AGENCY_LIST_FETCHED,
      HttpStatus.OK,
    );
  }

  @Get('users')
  async getAllUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Res() res: Response,
  ) {
    const { users, totalUsers, currentPage } =
      await this._adminService.getPaginatedVerifiedUsers(page, limit);

    return CreateResponse.success(
      res,
      { users, totalUsers, currentPage },
      UserSuccessMessages.USER_LIST_FETCHED,
      HttpStatus.OK,
    );
  }

  @Patch('changeAgencyStatus/:id')
  changeAgencyStatus(@Param() param, @Res() res: Response, @Body() action) {
    console.log('param', param);
    return this._adminService.changeAgencyStatus(param.id, res, action.status);
  }

  @Patch('changeUserStatus/:id')
  changeUserStatus(@Param() param, @Res() res: Response, @Body() action) {
    return this._adminService.changeUserStatus(param.id, res, action.status);
  }
  @Patch('confirmation/:id')
  confirmation(@Param() param, @Res() res: Response, @Body() action) {
    return this._adminService.confirmation(param.id, res, action.status);
  }
  @Post('filter')
  async getFilteredData(@Query() filterData: FilterDataDto, @Body() user) {
    return this._adminService.getFilteredData(filterData, user.user);
  }
  @Post('searchUsers')
  async searchUsers(@Query() searchText, @Body() user) {
    return this._adminService.searchUsers(searchText.searchText, user.user);
  }
  @Patch('logout')
  async agencyLogout(@Req() req: Request, @Res() res: Response) {
    res.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.clearCookie('refresh_token', {
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
