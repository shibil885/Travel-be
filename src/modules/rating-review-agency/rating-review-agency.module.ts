import { Module } from '@nestjs/common';
import { RatingReviewAgencyService } from './rating-review-agency.service';
import { RatingReviewAgencyController } from './rating-review-agency.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ReviewForAgency,
  ReviewForAgencySchema,
} from './schema/rating-review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReviewForAgency.name, schema: ReviewForAgencySchema },
    ]),
  ],
  providers: [RatingReviewAgencyService],
  controllers: [RatingReviewAgencyController],
})
export class RatingReviewAgencyModule {}
