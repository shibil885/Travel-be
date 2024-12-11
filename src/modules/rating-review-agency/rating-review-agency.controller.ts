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
import { RatingReviewAgencyService } from './rating-review-agency.service';
import { Request, Response } from 'express';

@Controller('rating-review-agency')
export class RatingReviewAgencyController {
  constructor(private _reviewRatingAgency: RatingReviewAgencyService) {}

  @Post(':id')
  async addReview(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') agencyId: string,
    @Body()
    body: {
      rating: number;
      review: string;
    },
  ) {
    try {
      console.log(body);
      if (!agencyId || !body)
        throw new BadRequestException(
          !agencyId ? 'Package id not provided' : 'Feedback not provided',
        );
      const result = await this._reviewRatingAgency.createReview(
        agencyId,
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

  @Get('isExisting/:id')
  async isFeedBackExisting(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') agencyId: string,
  ) {
    try {
      if (!agencyId)
        throw new BadRequestException('Package id id not provided');
      const result = await this._reviewRatingAgency.isFeedBackExisting(
        agencyId,
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
