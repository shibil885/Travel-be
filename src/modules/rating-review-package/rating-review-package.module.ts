import { Module } from '@nestjs/common';
import { RatingReviewPackageService } from './rating-review-package.service';
import { RatingReviewPackageController } from './rating-review-package.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ReviewForPackage,
  ReviewForPackageSchema,
} from '../rating-review-agency/schema/rating-review.schema';

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
