import {
  Body,
  ConflictException,
  Controller,
  Get,
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
import { EditCouponDto } from 'src/common/dtos/editCoupon.dto';

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
      console.log(createdCoupon);
      if (createdCoupon) {
        return res.status(HttpStatus.CREATED).json({
          success: true,
          message: 'Successfully created new coupon',
        });
      }
      throw new InternalServerErrorException();
    } catch (error) {
      console.log('error occured while create new coupon', error);
      if (error instanceof ConflictException) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Put('editCoupon/:id')
  async editCoupon(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: EditCouponDto,
  ) {
    try {
      const response = await this.couponService.editCoupon(id, body);
      if (response)
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Coupon successefully updated' });
      throw new InternalServerErrorException();
    } catch (error) {
      console.log('error occured while edit coupon');
      if (error instanceof ConflictException) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({ success: false, message: error.message });
      } else if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

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
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Get('getAllCoupons')
  async getAllCoupons(@Res() res: Response) {
    try {
      const result = await this.couponService.getAllCoupon();
      if (result.length > 0) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'List of Coupons', coupons: result });
      } else if (result.length == 0) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    } catch (error) {
      console.log('error occured', error);
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: 'Cant find Coupons', coupons: [] });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message, coupons: [] });
    }
  }
}
