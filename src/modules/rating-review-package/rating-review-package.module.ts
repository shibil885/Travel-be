import { Module } from '@nestjs/common';
import { RatingReviewPackageService } from './rating-review-package.service';
import { RatingReviewPackageController } from './rating-review-package.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ReviewForPackage,
  ReviewForPackageSchema,
} from './schema/review-rating.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReviewForPackage.name, schema: ReviewForPackageSchema },
    ]),
  ],
  providers: [RatingReviewPackageService],
  controllers: [RatingReviewPackageController],
})
export class RatingReviewPackageModule {}
