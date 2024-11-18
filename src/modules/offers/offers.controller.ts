import {
  Controller,
  Get,
  HttpStatus,
  NotAcceptableException,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { Request, Response } from 'express';

@Controller('offers')
export class OffersController {
  constructor(private readonly _offerService: OffersService) {}

  @Get()
  async getAllOffers(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    try {
      const response = await this._offerService.getAllOffers(
        req['agency']['sub'],
        page,
        limit,
      );
      if (response.offers.length > 0) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: '',
          offers: response.offers,
          totalItems: response.offerCount,
        });
      }
      return res.status(HttpStatus.OK).json({
        info: true,
        message: 'No offers available. Please add',
        offers: [],
        totalItem: 0,
      });
    } catch (error) {
      if (error instanceof NotAcceptableException) {
        return res
          .status(HttpStatus.NOT_ACCEPTABLE)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Get('applicable/:id')
  async getApplicablePackages(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') offerId: string,
  ) {
    try {
      const response = await this._offerService.getApplicablePackages(offerId);
      if (response) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'List of  applicable packages',
          packages: response,
        });
      }
      return res
        .status(HttpStatus.OK)
        .json({ info: true, message: 'Add offers to packages' });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }
}
