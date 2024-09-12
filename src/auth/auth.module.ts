import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth.constant';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from 'src/modules/otp/schema/otp.schema';
import { AgencyModule } from 'src/modules/agency/agency.module';
import { AdminModule } from 'src/modules/admin/admin.module';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '2hr' },
    }),
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    AgencyModule,
    AdminModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
