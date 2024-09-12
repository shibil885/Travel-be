import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { OtpModule } from './modules/otp/otp.module';
import { AuthModule } from './auth/auth.module';
import { AgencyModule } from './modules/agency/agency.module';
import { AdminModule } from './modules/admin/admin.module';
import { PackageModule } from './modules/package/package.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot('mongodb://127.0.0.1/travel'),
    ConfigModule.forRoot({ isGlobal: true }),
    OtpModule,
    AuthModule,
    AgencyModule,
    AdminModule,
    PackageModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
