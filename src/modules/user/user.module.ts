import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Otp, OtpSchema } from '../otp/schema/otp.schema';
import { Agency, AgencySchema } from '../agency/schema/agency.schema';
import { Package, PackageSchema } from '../package/schema/package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Agency.name, schema: AgencySchema },
      { name: Package.name, schema: PackageSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
