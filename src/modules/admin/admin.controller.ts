import { Body, Controller, Get, Param, Patch, Res } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('agencies')
  findAllAgenciees(@Res() res: Response) {
    console.log('callled');
    return this.adminService.findAllAgencies(res);
  }

  @Get('users')
  findAllUsers(@Res() res: Response) {
    console.log('working');
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
}
