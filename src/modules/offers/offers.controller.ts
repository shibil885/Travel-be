import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  NotAcceptableException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { Request, Response } from 'express';
import { AddOfferDto } from 'src/common/dtos/addOffer.dto';
import { EditOfferDto } from 'src/common/dtos/editOffer.dto';

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
        Number(page),
        Number(limit),
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

  @Get(':offerId')
  async getOneOffer(@Res() res: Response, @Param('offerId') offerId: string) {
    try {
      const offer = await this._offerService.getOneOffer(offerId);
      if (offer) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Requisted offer', offer: offer });
      }
      return res.status(HttpStatus.OK).json({
        info: true,
        message: 'Requisted offer not found',
        offer: {},
      });
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
          packages: response[0].packages,
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

  @Post('addOffer')
  async addOffer(
    @Req() req: Request,
    @Res() res: Response,
    @Body() offerData: AddOfferDto,
  ) {
    try {
      const response = await this._offerService.addOffer(
        req['agency']['sub'],
        offerData,
      );
      if (response) {
        return res
          .status(HttpStatus.CREATED)
          .json({ success: true, message: 'New Offer Added' });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      } else if (error instanceof ConflictException) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({ success: false, message: error.message });
      } else {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: error.message });
      }
    }
  }

  @Put('edit/:id')
  async editOffer(
    @Res() res: Response,
    @Body() offerData: EditOfferDto,
    @Param('id') offerId: string,
  ) {
    try {
      const response = await this._offerService.editOffer(offerId, offerData);
      if (response) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Offer updated' });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      } else if (error instanceof ConflictException) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }
  @Get('packages/:id')
  async getPackgesForApplyOffer(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') offerId: string,
  ) {
    try {
      const response = await this._offerService.getPackagesForApplyOffer(
        req['agency']['sub'],
        offerId,
      );
      if (response.length > 0) {
        return res.status(HttpStatus.OK).json({
          succss: true,
          messsage: 'List of packages for apply offers',
          packages: response,
        });
      }
      return res.status(HttpStatus.OK).json({
        info: true,
        message: 'Add packages for apply offers',
        packages: [],
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ suucess: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ suucess: false, message: error.message });
    }
  }

  @Patch('apply/:id')
  async applyOffer(
    @Res() res: Response,
    @Body('packageId') packageId: string,
    @Param('id') offerId: string,
  ) {
    try {
      const response = await this._offerService.applyOffer(offerId, packageId);
      if (response) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Offer applied to the package' });
      }
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: 'Offer not applied' });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, messahe: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, messahe: error.message });
    }
  }

  @Patch('remove/:id')
  async romoveOffer(
    @Res() res: Response,
    @Body('packageId') packageId: string,
    @Param('id') offerId: string,
  ) {
    try {
      const response = await this._offerService.removeOffer(offerId, packageId);
      if (response) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Package removed from the offer' });
      }
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: 'Offer cant remove ' });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, messahe: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, messahe: error.message });
    }
  }
}
