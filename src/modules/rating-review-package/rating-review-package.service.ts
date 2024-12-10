import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReviewForPackage } from './schema/review-rating.schema';

@Injectable()
export class RatingReviewPackageService {
  constructor(
    @InjectModel(ReviewForPackage.name)
    private _ReviewRatingModel: Model<ReviewForPackage>,
  ) {}

  async createReview(
    packageId: string,
    userId: string,
    rating: number,
    review: string,
  ) {
    const packageReview = await this._ReviewRatingModel.findOne({
      packageId: new Types.ObjectId(packageId),
    });

    if (!packageReview) {
      const newReview = new this._ReviewRatingModel({
        packageId: new Types.ObjectId(packageId),
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
      const existingReview = packageReview.reviews.find((item) =>
        item.userId.equals(new Types.ObjectId(userId)),
      );

      if (existingReview) {
        existingReview.rating = rating;
        existingReview.review = review;
        existingReview.created_at = new Date();
      } else {
        packageReview.reviews.push({
          userId: new Types.ObjectId(userId),
          rating,
          review,
          created_at: new Date(),
        });
      }
      packageReview.averageRating = this._calculateAverageRating(
        packageReview.reviews,
      );
      return packageReview.save();
    }
  }

  async getReviews(packageId: string) {
    return this._ReviewRatingModel.findOne({ packageId }).exec();
  }

  async isFeedBackExisting(packageId: string, userId: string) {
    console.log('userId', userId);
    const isExisting = await this._ReviewRatingModel.findOne({
      packageId: new Types.ObjectId(packageId),
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
