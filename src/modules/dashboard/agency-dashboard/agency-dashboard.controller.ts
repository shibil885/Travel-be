import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { AgencyDashboardService } from './agency-dashboard.service';
import { Request, Response } from 'express';
import { Role } from 'src/common/enum/role.enum';

@Controller('agency-dashboard')
export class AgencyDashboardController {
  constructor(
    private readonly _AgencyDashboardService: AgencyDashboardService,
  ) {}

  @Get('recentBookings')
  async getRecentBookings(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this._AgencyDashboardService.recentBookings(
        req[Role.AGENCY]['sub'],
      );
      if (result.length) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'List of recent bookings',
          bookings: result,
        });
      } else {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'No recent bookings found for this agency',
          bookings: [],
        });
      }
    } catch (error) {
      console.log('Error occured while fetch recent booking', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        bookings: [],
      });
    }
  }

  @Get('currentTravellings')
  async getCurrentTravelling(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this._AgencyDashboardService.getCurrentTravellings(
        req[Role.AGENCY]['sub'],
      );
      if (result.length) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'List of current Travellings',
          bookings: result,
        });
      } else {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'No current travellings found for this agency',
          bookings: [],
        });
      }
    } catch (error) {
      console.log('Error occured while fetch current travellings', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        bookings: [],
      });
    }
  }

  @Get('statsData')
  async getStatsData(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this._AgencyDashboardService.getStatsCardData(
        req[Role.AGENCY]['sub'],
      );
      if (result) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'List of current Travellings',
          packagesCount: result.packagesCount,
          totalBookings: result.totalBookings,
          totalRevenue: result.totalRevenue[0].totalRevenue,
        });
      } else {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'No current travellings found for this agency',
          bookings: [],
        });
      }
    } catch (error) {
      console.log('Error occured while fetch current travellings', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        bookings: [],
      });
    }
  }
}
