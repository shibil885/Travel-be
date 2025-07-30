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
import { UpdateStatusDto } from 'src/common/dtos/updateUserStaus.dto';
import { UpdateConfirmationDto } from 'src/common/dtos/agencyConfirmation.dto';
import { ApiResponse } from 'src/common/decorators/response.decorator';
@Controller('admin')
export class AdminController {
  constructor(private _adminService: AdminService) {}

  @Get('agency')
  @ApiResponse(AgencySuccessMessages.AGENCY_LIST_FETCHED)
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

  @Patch('agency/:agencyId')
  async changeAgencyStatus(
    @Param('agencyId') agencyId,
    @Res() res: Response,
    @Body() action: UpdateStatusDto,
  ) {
    const { isActive, message } = await this._adminService.updateAgencyStatus(
      agencyId,
      action.status,
    );

    CreateResponse.success(res, { isActive }, message);
  }

  @Patch('agency/:id/confirm')
  async updateAgencyConfirmation(
    @Param() param,
    @Res() res: Response,
    @Body() action: UpdateConfirmationDto,
  ) {
    const { isConfirmed, message } =
      await this._adminService.updateConfirmationOfAgency(
        param.id,
        action.status,
      );
    CreateResponse.success(res, { isConfirmed }, message);
  }

  @Get('user')
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

  @Patch('user/:userId')
  async changeUserStatus(
    @Param('userId') userId,
    @Res() res: Response,
    @Body() action: UpdateStatusDto,
  ) {
    const { isActive, message } = await this._adminService.updateUserStatus(
      userId,
      action.status,
    );

    CreateResponse.success(res, { isActive }, message);
  }

  @Post('filter')
  async getFilteredData(
    @Query() filterData: FilterDataDto,
    @Res() res: Response,
    @Body('user') user: 'user' | 'agency',
  ) {
    const { filteredData, message } = await this._adminService.getFilteredData(
      filterData,
      user,
    );
    CreateResponse.success(res, { filteredData }, message);
  }

  @Post('searchUsers')
  async searchUsers(@Query() searchText, @Res() res: Response, @Body() user) {
    const { message, users } = await this._adminService.searchUsers(
      searchText.searchText,
      user.user,
    );
    CreateResponse.success(res, { users }, message);
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
