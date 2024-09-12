import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('changeAgencyStatus/:id')
  changeAgencyStatus(@Param() param, @Res() res: Response, @Body() action) {
    return this.adminService.changeAgencyStatus(param.id, res, action.action);
  }

  @Post('changeUserStatus/:id')
  changeUserStatus(@Param() param, @Res() res: Response, @Body() action) {
    return this.adminService.changeUserStatus(param.id, res, action.action);
  }
}
