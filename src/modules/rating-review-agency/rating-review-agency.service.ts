import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ReviewForAgency } from './schema/rating-review.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class RatingReviewAgencyService {
  constructor(
    @InjectModel(ReviewForAgency.name)
    private _ReviewRatingModel: Model<ReviewForAgency>,
  ) {}

  async createReview(
    agencyId: string,
    userId: string,
    rating: number,
    review: string,
  ) {
    const agencyReview = await this._ReviewRatingModel.findOne({
      agencyId: new Types.ObjectId(agencyId),
    });

    if (!agencyReview) {
      const newReview = new this._ReviewRatingModel({
        agencyId: new Types.ObjectId(agencyId),
        reviews: [
          {
            userId: new Types.ObjectId(userId),
            rating,
            review,
            created_at: new Date(),
          },
        ],
        averageRating: rating,
      });
      return newReview.save();
    } else {
      const existingReview = agencyReview.reviews.find((item) =>
        item.userId.equals(new Types.ObjectId(userId)),
      );

      if (existingReview) {
        existingReview.rating = rating;
        existingReview.review = review;
        existingReview.created_at = new Date();
      } else {
        agencyReview.reviews.push({
          userId: new Types.ObjectId(userId),
          rating,
          review,
          created_at: new Date(),
        });
      }
      agencyReview.averageRating = this._calculateAverageRating(
        agencyReview.reviews,
      );
      return agencyReview.save();
    }
  }

  async isFeedBackExisting(packageId: string, userId: string) {
    const isExisting = await this._ReviewRatingModel.findOne({
      agencyId: new Types.ObjectId(packageId),
      'reviews.userId': new Types.ObjectId(userId),
    });
    const result = {
      rating: 0,
      review: '',
    };
    if (isExisting) {
      const userReview = isExisting.reviews.find((review) =>
        review.userId.equals(userId),
      );
      if (userReview) {
        result.rating = userReview.rating;
        result.review = userReview.review;
      }
    }
    return result;
  }

  private _calculateAverageRating(reviews: Array<{ rating: number }>) {
    const total = reviews.reduce(
      (sum, r) => sum + parseFloat(String(r.rating)),
      0,
    );
    return (total / reviews.length).toFixed(2);
  }
}
