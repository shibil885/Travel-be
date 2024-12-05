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
import { CouponModule } from './modules/coupon/coupon.module';
import { RazorpayModule } from 'nestjs-razorpay';
import { PaymentModule } from './modules/payment/payment.module';
import { CookieMiddleware } from './middlewares/cookie.middleware';
import { BookingModule } from './modules/booking/booking.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { OffersModule } from './modules/offers/offers.module';
import { PostsModule } from './modules/posts/posts.module';
import { AdminDashboardModule } from './modules/dashboard/admin-dashboard/admin-dashboard.module';
import { AgencyDashboardModule } from './modules/dashboard/agency-dashboard/agency-dashboard.module';
import { ChatModule } from './modules/chat/chat.module';
import { RatingReviewAgencyModule } from './modules/rating-review-agency/rating-review-agency.module';
import { RatingReviewPackageModule } from './modules/rating-review-package/rating-review-package.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot('mongodb://127.0.0.1/travel'),
    ConfigModule.forRoot({ isGlobal: true }),
    RazorpayModule.forRoot({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    }),
    OtpModule,
    AuthModule,
    AgencyModule,
    AdminModule,
    PackageModule,
    CategoryModule,
    CloudinaryModule,
    NotificationModule,
    CouponModule,
    RazorpayModule,
    PaymentModule,
    BookingModule,
    WalletModule,
    OffersModule,
    PostsModule,
    AdminDashboardModule,
    AgencyDashboardModule,
    ChatModule,
    RatingReviewAgencyModule,
    RatingReviewPackageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CookieMiddleware)
      .forRoutes('*')
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/(.*)', method: RequestMethod.ALL },
        { path: '/user/isExistingMail', method: RequestMethod.POST },
        { path: '/agency/isExistingMail', method: RequestMethod.POST },
        { path: '/agency/isExistingName', method: RequestMethod.POST },
        { path: '/user/signup', method: RequestMethod.POST },
        { path: '/agency/signup', method: RequestMethod.POST },
        { path: '/otp/(.*)', method: RequestMethod.ALL },
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
        { path: '/otp/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
