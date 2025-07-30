import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { Request } from 'express';
import { AddOfferDto } from 'src/common/dtos/addOffer.dto';
import { EditOfferDto } from 'src/common/dtos/editOffer.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiResponse } from 'src/common/decorators/response.decorator';

@Controller('offer')
export class OffersController {
  constructor(private readonly _offerService: OffersService) {}

  @Get()
  async getAllOffers(@Req() req: Request, @Query() pagination: PaginationDto) {
    return await this._offerService.getAllOffers(
      req['agency']['sub'],
      pagination.page,
      pagination.limit,
    );
  }

  @Get(':offerId')
  async getOneOffer(@Param('offerId') offerId: string) {
    const offer = await this._offerService.getOneOffer(offerId);
    if (offer) return { offer: offer };
    return { info: true };
  }

  @Get('packages/:id')
  @ApiResponse('Applicable packages')
  async getApplicablePackages(@Param('id') offerId: string) {
    return await this._offerService.getApplicablePackages(offerId);
  }

  @Get('packages/apply/:id')
  @ApiResponse('applied')
  async getPackgesForApplyOffer(
    @Req() req: Request,
    @Param('id') offerId: string,
  ) {
    return await this._offerService.getPackagesForApplyOffer(
      req['agency']['sub'],
      offerId,
    );
  }

  @Post()
  async addOffer(@Req() req: Request, @Body() offerData: AddOfferDto) {
    return await this._offerService.createOffer(
      req['agency']['sub'],
      offerData,
    );
  }

  @Put(':id')
  async editOffer(
    @Body() offerData: EditOfferDto,
    @Param('id') offerId: string,
  ) {
    return await this._offerService.editOffer(offerId, offerData);
  }
  @Patch('apply/:id')
  async applyOffer(
    @Body('packageId') packageId: string,
    @Param('id') offerId: string,
  ) {
    return await this._offerService.applyOffer(offerId, packageId);
  }

  @Delete(':offerId/:packageId')
  async removeOffer(
    @Param('offerId') offerId: string,
    @Param('packageId') packageId: string,
  ) {
    return await this._offerService.removeOffer(offerId, packageId);
  }
}
