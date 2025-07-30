import { forwardRef, Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schema/otp.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Agency, AgencySchema } from '../agency/schema/agency.schema';
import { AuthModule } from 'src/auth/auth.module';
import { OtpRepository } from './repositories/otp.repsitory';
import { AgencyRepository } from '../agency/repositories/agency.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { Package, PackageSchema } from '../package/schema/package.schema';
import { NotificationService } from '../notification/notification.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Otp.name, schema: OtpSchema },
      { name: User.name, schema: UserSchema },
      { name: Agency.name, schema: AgencySchema },
      { name: Package.name, schema: PackageSchema },
    ]),
    forwardRef(() => AuthModule),
    NotificationModule,
  ],
  controllers: [OtpController],
  providers: [
    OtpService,
    { provide: 'IOtpRepository', useClass: OtpRepository },
    { provide: 'IUserRepository', useClass: UserRepository },
    { provide: 'IAgencyRepository', useClass: AgencyRepository },
    { provide: 'NotificationService', useClass: NotificationService },
  ],
})
export class OtpModule {}
