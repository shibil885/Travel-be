import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { BookingService } from '../booking/booking.service';
import { Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private bookingService: BookingService,
  ) {}

  @Post('create-order')
  async createOrder(
    @Req() req: Request,
    @Body() body: { packageId: string; couponId: string },
  ) {
    return this.paymentService.createOrder(
      req['user'].sub,
      body.packageId,
      body.couponId,
    );
  }

  @Post('verify')
  async verifyPayment(
    @Req() req: Request,
    @Res() res: Response,
    @Body() paymentData,
  ) {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      packageId,
      agencyId,
      couponId,
      bookingData,
    } = paymentData;

    const isValid = this.paymentService.verifySignature(
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    );

    if (!isValid) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: 'Payment verification failed' });
    }

    try {
      const result = await this.bookingService.saveBooking(
        req['user'].sub,
        packageId,
        agencyId,
        couponId,
        bookingData,
      );
      console.log('Booking successful:', result);
      return res
        .status(HttpStatus.CREATED)
        .json({ success: true, message: 'Successfully booked' });
    } catch (error) {
      console.error('Booking error:', error);
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: error.message,
        });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }
}
