import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/repositories/base/base.repository';
import { Otp, OtpDocument } from '../schema/otp.schema';
import { IOtpRepository } from 'src/repositories/otp/otp.interface';

@Injectable()
export class OtpRepository
  extends BaseRepository<OtpDocument>
  implements IOtpRepository
{
  constructor(
    @InjectModel(Otp.name)
    private readonly _otpModel: Model<OtpDocument>,
  ) {
    super(_otpModel);
  }

  async createOtp(email: string, otp: number): Promise<OtpDocument> {
    const newOtp = new this._otpModel({ email, otp });
    return await newOtp.save();
  }

  findByEmail(email: string): Promise<OtpDocument | null> {
    return this._otpModel.findOne({ email }).exec();
  }

  async deleteByEmail(email: string): Promise<boolean> {
    const result = await this._otpModel.deleteOne({ email }).exec();
    return result.deletedCount > 0;
  }

  findValidOtp(email: string, otp: number): Promise<OtpDocument | null> {
    return this._otpModel.findOne({ email, otp }).exec();
  }
}
