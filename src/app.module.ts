import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from './modules/user/user.module';
import { OtpModule } from './modules/otp/otp.module';
import { AuthModule } from './auth/auth.module';
import { AgencyModule } from './modules/agency/agency.module';
import { AdminModule } from './modules/admin/admin.module';
import { PackageModule } from './modules/package/package.module';
import { CategoryModule } from './modules/category/category.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { NotificationModule } from './modules/notification/notification.module';
import { CheckActiveMiddleware } from './middlewares/isActive.middleware';

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
    CloudinaryModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/(.*)', method: RequestMethod.ALL },
        { path: '/user/isExistingMail', method: RequestMethod.POST },
        { path: '/agency/isExistingMail', method: RequestMethod.POST },
        { path: '/agency/isExistingName', method: RequestMethod.POST },
        { path: '/user/signup', method: RequestMethod.POST },
        { path: '/agency/signup', method: RequestMethod.POST },
        { path: 'otp/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
    consumer
      .apply(CheckActiveMiddleware)
      .exclude(
        { path: 'auth/(.*)', method: RequestMethod.ALL },
        { path: 'admin/(.*)', method: RequestMethod.ALL },
        { path: '/user/isExistingMail', method: RequestMethod.POST },
        { path: '/agency/isExistingMail', method: RequestMethod.POST },
        { path: '/agency/isExistingName', method: RequestMethod.POST },
        { path: '/user/signup', method: RequestMethod.POST },
        { path: '/agency/signup', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
