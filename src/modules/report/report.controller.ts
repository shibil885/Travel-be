import {
  BadRequestException,
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
  UseFilters,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { Request, Response } from 'express';
import { AllExceptionsFilter } from 'src/common/filter/ecception.filter';

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

  @Post('addReview/:id')
  @UseFilters(AllExceptionsFilter)
  async addReview(
    @Res() res: Response,
    @Param('id') reportId: string,
    @Body('review') review: string,
  ) {
    const result = await this._reportService.addReview(reportId, review);
    if (result.isModified) {
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: 'Review added' });
    }
    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: 'Cant update review' });
  }

  @Patch('changestatus/:id')
  @UseFilters(AllExceptionsFilter)
  async changesStatus(
    @Res() res: Response,
    @Param('id') reportId: string,
    @Body('status') status: string,
  ) {
    const result = await this._reportService.changeStatus(reportId, status);
    if (result) {
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: 'Status updated' });
    }
    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: 'Status not updated' });
  }
}
