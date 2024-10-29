import { Controller, Post, Body, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

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
}
