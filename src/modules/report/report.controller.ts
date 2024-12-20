import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { Request, Response } from 'express';

@Controller('report')
export class ReportController {
  constructor(private _reportService: ReportService) {}

  @Get()
  async getAllReports(
    @Res() res: Response,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    try {
      const response = await this._reportService.getAllReports(page, limit);
      if (response.reports.length) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'List of repots',
          reports: response.reports,
          totalItems: response.reportsCount,
        });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Post('add')
  async addReport(@Req() req: Request, @Res() res: Response, @Body() body) {
    try {
      const { targetType, targetId, reason, description } = body;
      const response = await this._reportService.addReport(
        req['user']['sub'],
        targetType,
        targetId,
        reason,
        description,
      );
      if (response) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Report added' });
      }
    } catch (error) {
      console.error('Error occured while add report', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Get('getsinglereport/:id/:targetType')
  async getReport(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') reportId: string,
    @Param('targetType') targetType: string,
    @Query('commentId') commentId: string,
  ) {
    try {
      const result = await this._reportService.getOneReport(
        reportId,
        targetType,
        commentId,
      );
      console.log('targetType ==>', result);
      if (result.length) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'report data',
          reportData: result[0],
        });
      } else {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'report data', reportData: [] });
      }
    } catch (error) {
      console.error('error occured', error);
      if (error instanceof BadRequestException) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: true, message: error.message, reportData: [] });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: true, message: error.message, reportData: [] });
    }
  }
}
