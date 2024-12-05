import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { RatingReviewPackageService } from './rating-review-package.service';
import { Request, Response } from 'express';

@Controller('rating-review-package')
export class RatingReviewPackageController {
  constructor(private _reviewRatingService: RatingReviewPackageService) {}
  @Post(':id')
  async addReview(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') packageId: string,
    @Body() body: { rating: number; review: string },
  ) {
    try {
      if (!packageId || !body)
        throw new BadRequestException(
          !packageId ? 'Package id not provided' : 'Feedback not provided',
        );
      const result = await this._reviewRatingService.createReview(
        packageId,
        req['user']['sub'],
        body.rating,
        body.review,
      );
      if (result) {
        res
          .status(HttpStatus.CREATED)
          .json({ success: true, message: 'Feedback recieved' });
      } else {
      }
    } catch (error) {
      console.log('Error occured while feedback creat', error);
      if (error instanceof BadRequestException) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Get(':packageId')
  async getReviews(@Param('packageId') packageId: string) {
    return this._reviewRatingService.getReviews(packageId);
  }

  @Get('isExisting/:id')
  async isFeedBackExisting(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') packageId: string,
  ) {
    try {
      if (!packageId)
        throw new BadRequestException('Package id id not provided');
      const result = await this._reviewRatingService.isFeedBackExisting(
        packageId,
        req['user']['sub'],
      );
      if (result) {
        return res.status(HttpStatus.OK).json({
          success: true,
          rating: result.rating,
          review: result.review,
        });
      }
    } catch (error) {
      console.log('Error occured while check feedback exist or not', error);
      if (error instanceof BadRequestException) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }
}
