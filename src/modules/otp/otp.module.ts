import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schema/otp.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Agency, AgencySchema } from '../agency/schema/agency.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Otp.name, schema: OtpSchema },
      { name: User.name, schema: UserSchema },
      { name: Agency.name, schema: AgencySchema },
    ]),
  ],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
