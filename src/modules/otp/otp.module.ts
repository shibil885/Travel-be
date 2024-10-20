import { forwardRef, Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schema/otp.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Agency, AgencySchema } from '../agency/schema/agency.schema';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Otp.name, schema: OtpSchema },
      { name: User.name, schema: UserSchema },
      { name: Agency.name, schema: AgencySchema },
    ]),
    forwardRef(() => AuthModule),
    NotificationModule,
  ],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
