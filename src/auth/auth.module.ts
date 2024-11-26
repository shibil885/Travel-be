import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from 'src/modules/otp/schema/otp.schema';
import { AgencyModule } from 'src/modules/agency/agency.module';
import { AdminModule } from 'src/modules/admin/admin.module';
import { OtpModule } from 'src/modules/otp/otp.module';
@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    AgencyModule,
    AdminModule,
    forwardRef(() => OtpModule),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(AuthMiddleware)
  //     .forRoutes(
  //       { path: 'auth/user', method: RequestMethod.POST },
  //       { path: 'auth/is-Authenticated', method: RequestMethod.GET },
  //     );
  // }
}
