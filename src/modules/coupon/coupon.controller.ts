// import {
//   Body,
//   ConflictException,
//   Controller,
//   Get,
//   HttpStatus,
//   InternalServerErrorException,
//   NotFoundException,
//   Param,
//   Patch,
//   Post,
//   Put,
//   Query,
//   Req,
//   Res,
// } from '@nestjs/common';
// import { CouponService } from './coupon.service';
// import { Response } from 'express';
// import { CreateCouponDto } from 'src/common/dtos/createCoupon.gto';
// import { EditCouponDto } from 'src/common/dtos/editCoupon.dto';

// @Controller('coupon')
// export class CouponController {
//   constructor(private couponService: CouponService) {}
//   @Post('createCoupon')
//   async createCoupon(
//     @Res() res: Response,
//     @Body() couponData: CreateCouponDto,
//   ) {
//     try {
//       const createdCoupon = await this.couponService.createCoupon(couponData);
//       console.log(createdCoupon);
//       if (createdCoupon) {
//         return res.status(HttpStatus.CREATED).json({
//           success: true,
//           message: 'Successfully created new coupon',
//         });
//       }
//       throw new InternalServerErrorException();
//     } catch (error) {
//       console.log('error occured while create new coupon', error);
//       if (error instanceof ConflictException) {
//         return res
//           .status(HttpStatus.CONFLICT)
//           .json({ success: false, message: error.message });
//       }
//       return res
//         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//         .json({ success: false, message: error.message });
//     }
//   }

//   @Put('editCoupon/:id')
//   async editCoupon(
//     @Res() res: Response,
//     @Param('id') id: string,
//     @Body() body: EditCouponDto,
//   ) {
//     try {
//       const response = await this.couponService.editCoupon(id, body);
//       if (response)
//         return res
//           .status(HttpStatus.OK)
//           .json({ success: true, message: 'Coupon successefully updated' });
//       throw new InternalServerErrorException();
//     } catch (error) {
//       console.log('error occured while edit coupon');
//       if (error instanceof ConflictException) {
//         return res
//           .status(HttpStatus.CONFLICT)
//           .json({ success: false, message: error.message });
//       } else if (error instanceof NotFoundException) {
//         return res
//           .status(HttpStatus.NOT_FOUND)
//           .json({ success: false, message: error.message });
//       }
//       return res
//         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//         .json({ success: false, message: error.message });
//     }
//   }

//   @Patch('changeStatus/:id')
//   async changeStatus(
//     @Res() res: Response,
//     @Param('id') id: string,
//     @Body() body: { status: boolean },
//   ) {
//     try {
//       const result = await this.couponService.changeStatus(id, body.status);
//       if (result) {
//         return res
//           .status(HttpStatus.OK)
//           .json({ success: true, message: 'Status successfully updated' });
//       }
//       throw new InternalServerErrorException();
//     } catch (error) {
//       console.log('error occured while change status of coupon', error);
//       if (error instanceof NotFoundException) {
//         return res
//           .status(HttpStatus.NOT_FOUND)
//           .json({ success: false, message: error.message });
//       }
//       return res
//         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//         .json({ success: false, message: error.message });
//     }
//   }

//   @Get('getAllCoupons')
//   async getAllCoupons(
//     @Res() res: Response,
//     @Query('currentPage') page: number,
//     @Query('limit') limit: number,
//   ) {
//     try {
//       const result = await this.couponService.getAllCoupon(page, Number(limit));
//       if (result.coupons.length > 0) {
//         return res.status(HttpStatus.OK).json({
//           success: true,
//           message: 'List of Coupons',
//           coupons: result.coupons,
//           totalItems: result.couponsCount,
//           currentPage: result.page,
//         });
//       } else if (result.coupons.length == 0) {
//         throw new NotFoundException();
//       }
//       throw new InternalServerErrorException();
//     } catch (error) {
//       console.log('error occured', error);
//       if (error instanceof NotFoundException) {
//         return res
//           .status(HttpStatus.NOT_FOUND)
//           .json({ success: false, message: 'Cant find Coupons', coupons: [] });
//       }
//       return res
//         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//         .json({ success: false, message: error.message, coupons: [] });
//     }
//   }

//   @Get('getCouponsForUser/:packageId')
//   async getCouponsForUser(
//     @Req() req: Request,
//     @Res() res: Response,
//     @Param('packageId') packageId: string,
//   ) {
//     try {
//       const userId = req['user'].sub;
//       const coupons = await this.couponService.getAllCouponsForUser(
//         packageId,
//         userId,
//       );
//       if (coupons.length == 0) {
//         return res.status(HttpStatus.OK).json({ success: true, coupons: [] });
//       }
//       return res.status(HttpStatus.OK).json({ success: true, coupons });
//     } catch (error) {
//       console.log('Error occured while fetch coupons for user', error);
//       if (error instanceof NotFoundException) {
//         return res
//           .status(HttpStatus.NOT_FOUND)
//           .json({ success: false, message: error.message });
//       } else if (error instanceof InternalServerErrorException) {
//         return res
//           .status(HttpStatus.INTERNAL_SERVER_ERROR)
//           .json({ success: false, message: error.message });
//       }
//     }
//   }
// }

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpStatus,
  Put,
  Req,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from 'src/common/dtos/createCoupon.gto';
import { EditCouponDto } from 'src/common/dtos/editCoupon.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiResponse } from 'src/common/decorators/response.decorator';
import { Request } from 'express';

@Controller('coupon')
export class CouponController {
  constructor(private readonly _couponService: CouponService) {}

  @Get()
  @ApiResponse('Coupon list fetched successfully')
  findAll(@Query() pagination: PaginationDto) {
    return this._couponService.getAllCoupons(pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiResponse('Coupon details fetched successfully')
  findOne(@Param('id') id: string) {
    return this._couponService.getCouponById(id);
  }

  @Get('package/:id')
  @ApiResponse('Coupons fetched for selected package')
  getCouponsForSelectedPackage(
    @Req() req: Request,
    @Param('id') packageId: string,
  ) {
    return this._couponService.getCouponForSelectedPackage(
      packageId,
      req['user']['sub'],
    );
  }

  @Post()
  @ApiResponse('Coupon created successfully', HttpStatus.CREATED)
  create(@Body() dto: CreateCouponDto) {
    return this._couponService.createCoupon(dto);
  }

  @Put(':id')
  @ApiResponse('Coupon updated')
  update(@Param('id') id: string, @Body() dto: EditCouponDto) {
    return this._couponService.updateCoupon(id, dto);
  }

  @Patch(':id')
  @ApiResponse('Coupon status changed')
  changeStatus(@Param('id') id: string, @Body('status') status) {
    return this._couponService.updateCouponStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._couponService.deleteCoupon(id);
  }
}
