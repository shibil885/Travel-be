import { Module } from '@nestjs/common';
import { RatingReviewAgencyService } from './rating-review-agency.service';
import { RatingReviewAgencyController } from './rating-review-agency.controller';

@Module({
  providers: [RatingReviewAgencyService],
  controllers: [RatingReviewAgencyController],
})
export class RatingReviewAgencyModule {}
