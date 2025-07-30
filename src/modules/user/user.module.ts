import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Otp, OtpSchema } from '../otp/schema/otp.schema';
import { Agency, AgencySchema } from '../agency/schema/agency.schema';
import { Package, PackageSchema } from '../package/schema/package.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UserRepository } from './repositories/user.repository';
import { OtpRepository } from '../otp/repositories/otp.repsitory';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Agency.name, schema: AgencySchema },
      { name: Package.name, schema: PackageSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: 'IOtpRepository', useClass: OtpRepository },
    { provide: 'IUserRepository', useClass: UserRepository },
  ],
  exports: [UserService],
})
export class UserModule {}
