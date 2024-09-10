import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { OtpModule } from './modules/otp/otp.module';
@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot('mongodb://localhost/travel'),
    ConfigModule.forRoot({ isGlobal: true }),
    OtpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
