import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { AdminDashboardService } from './admin-dashboard.service';

@Controller('admin-dashboard')
export class AdminDashboardController {
  constructor(private _dashboardService: AdminDashboardService) {}

  @Get('statasCard')
  async statasCard(@Res() res: Response) {
    try {
      const result = await this._dashboardService.statasCardDetails();
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Data to ststas card',
        result: result,
      });
    } catch (error) {
      console.log('Errro occured', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Get('revenue')
  async revenue(@Res() res: Response) {
    try {
      const result = await this._dashboardService.calculateTotalRevenue();
      console.log(result);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'revenue data',
        result: result,
      });
    } catch (error) {
      console.log('Errro occured', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }
}
