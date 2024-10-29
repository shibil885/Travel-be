import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-order')
  async createOrder(@Body('amount') amount: number = 1000) {
    return this.paymentService.createOrder(amount);
  }
}
