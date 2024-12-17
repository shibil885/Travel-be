import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Report } from './schema/report.schema';
import { Model } from 'mongoose';

@Injectable()
export class ReportService {
  constructor(@InjectModel(Report.name) private _ReportModel: Model<Report>) {}

  async addReport(
    reportedBy: string,
    targetType: string,
    targetId: string,
    reason: string,
    description: string,
  ) {
    const newReport = await new this._ReportModel({
      reportedBy,
      targetType,
      targetId,
      reason,
      description,
    }).save();
    return newReport;
  }

  async getAllReports(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [reports, reportsCount] = await Promise.all([
      this._ReportModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reportedBy'),
      this._ReportModel.countDocuments(),
    ]);
    return { reports, reportsCount };
  }
}
