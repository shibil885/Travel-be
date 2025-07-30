import { OtpDocument } from 'src/modules/otp/schema/otp.schema';
import { IBaseRepository } from '../base/base.interface';

export interface IOtpRepository extends IBaseRepository<OtpDocument> {
  createOtp(email: string, otp: number): Promise<OtpDocument>;
  findByEmail(email: string): Promise<OtpDocument | null>;
  deleteByEmail(email: string): Promise<boolean>;
  findValidOtp(email: string, otp: number): Promise<OtpDocument | null>;
}
