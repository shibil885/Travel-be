import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminDashboardService } from './admin-dashboard.service';
import { AgencyFilter } from 'src/common/constants/enum/agency-filter.enum';
import { PackageFilter } from 'src/common/constants/enum/package-filter.enum';

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
  @Get('topAgencies')
  async topAgencies(
    @Res() res: Response,
    @Query('query') filter: AgencyFilter,
  ) {
    try {
      const result = await this._dashboardService.topAgencies(filter);
      if (result.length) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: `Top agencies filtered by ${filter}`,
          agencies: result,
        });
      }
      return res.status(HttpStatus.OK).json({
        success: false,
        message: `No agencies found for the filter ${filter}`,
        agencies: [],
      });
    } catch (error) {
      console.log('error in top agencies', error);
      const statusCode =
        error instanceof BadRequestException
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred.',
        agencies: [],
      });
    }
  }

  @Get('topPackages')
  async topPackages(
    @Res() res: Response,
    @Query('query') filter: PackageFilter,
  ) {
    try {
      const result = await this._dashboardService.topPackages(filter);
      if (result.length) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: `Top packages filtered by ${filter}`,
          packages: result,
        });
      }
      return res.status(HttpStatus.OK).json({
        success: false,
        message: `No packages found for the filter ${filter}`,
        packages: [],
      });
    } catch (error) {
      console.log('error in top packages', error);
      const statusCode =
        error instanceof BadRequestException
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred.',
        packages: [],
      });
    }
  }

  @Get('generateReport')
  async generateReport(
    @Res() res: Response,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    try {
      console.log(start_date);
      console.log(end_date);
      const result = await this._dashboardService.generateReport(
        start_date,
        end_date,
      );
      console.log(result);
      if (result.length) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: `Report generated`,
          report: result,
        });
      }
      return res.status(HttpStatus.OK).json({
        success: false,
        message: `Report generated`,
        report: [],
      });
    } catch (error) {
      console.log('error in generate package', error);
      const statusCode =
        error instanceof BadRequestException
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred.',
        packages: [],
      });
    }
  }

  @Get('booking-trends')
  async getBookingTrends(
    @Res() res: Response,
    @Query('groupBy') groupBy: 'month' | 'year',
  ) {
    try {
      const result = await this._dashboardService.getBookingsTrends(
        groupBy || 'year',
      );
      if (result.length) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'List of graph data', data: result });
      }
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: 'List of graph data', data: [] });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message, data: [] });
    }
  }
}
