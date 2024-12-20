import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Report } from './schema/report.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class ReportService {
  constructor(@InjectModel(Report.name) private _ReportModel: Model<Report>) {}

  private async _handleFetchOfSingleReport(
    reportId: string,
    targetType: string,
    commentId = '',
  ) {
    if (commentId) {
      const data = await this._ReportModel.aggregate([
        { $match: { _id: new Types.ObjectId(reportId) } },
        {
          $lookup: {
            from: 'users',
            localField: 'reportedBy',
            foreignField: '_id',
            as: 'reportedBy',
          },
        },
        { $unwind: '$reportedBy' },
        {
          $lookup: {
            from: `${targetType}`,
            localField: 'targetId',
            foreignField: 'comments._id',
            as: 'targetDetails',
          },
        },
        { $unwind: '$targetId' },
      ]);
      return data;
    } else {
      const data = await this._ReportModel.aggregate([
        { $match: { _id: new Types.ObjectId(reportId) } },
        {
          $lookup: {
            from: 'users',
            localField: 'reportedBy',
            foreignField: '_id',
            as: 'reportedBy',
          },
        },
        { $unwind: '$reportedBy' },
        {
          $lookup: {
            from: `${targetType}`,
            localField: 'targetId',
            foreignField: '_id',
            as: 'targetId',
          },
        },
        { $unwind: '$targetId' },
      ]);
      return data;
    }
  }

  async addReport(
    reportedBy: string,
    targetType: string,
    targetId: string,
    reason: string,
    description: string,
  ) {
    const newReport = await new this._ReportModel({
      reportedBy: new Types.ObjectId(reportedBy),
      targetType,
      targetId: new Types.ObjectId(targetId),
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

  async getOneReport(reportId: string, targetType: string, commentId = '') {
    if (targetType === 'Post') {
      console.log('from post if');
      return this._handleFetchOfSingleReport(reportId, 'posts');
    } else if (targetType === 'Package') {
      return this._handleFetchOfSingleReport(reportId, 'packages');
    } else if (targetType === 'Agency') {
      return this._handleFetchOfSingleReport(reportId, 'agencies');
    } else if (targetType === 'Comment') {
      return this._handleFetchOfSingleReport(reportId, 'posts', commentId);
    } else {
      throw new BadRequestException('Unidentified target type');
    }
  }
}
