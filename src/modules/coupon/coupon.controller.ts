import {
  Body,
  ConflictException,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { Response } from 'express';
import { CreateCouponDto } from 'src/common/dtos/createCoupon.gto';

@Controller('coupon')
export class CouponController {
  constructor(private couponService: CouponService) {}
  @Post('createCoupon')
  async createCoupon(
    @Res() res: Response,
    @Body() couponData: CreateCouponDto,
  ) {
    try {
      const createdCoupon = await this.couponService.createCoupon(couponData);
      if (createdCoupon) {
        res.status(HttpStatus.CREATED).json({
          success: true,
          message: 'Successfully created new category',
        });
        throw new InternalServerErrorException();
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({ success: false, message: error.getResponse() });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.getResponse() });
    }
  }

  @Put('editCoupon')
  async editCoupon() {}

  @Patch('changeStatus/:id')
  async changeStatus(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: { status: boolean },
  ) {
    try {
      const result = await this.couponService.changeStatus(id, body.status);
      if (result) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Status successfully updated' });
      }
      throw new InternalServerErrorException();
    } catch (error) {
      console.log('error occured while change status of coupon', error);
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.getResponse() });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.getResponse() });
    }
  }
}
