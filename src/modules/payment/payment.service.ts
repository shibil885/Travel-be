import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(amount: number, currency: string = 'INR') {
    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_${Math.random()}`,
    };
    try {
      const order = await this.razorpay.orders.create(options);
      console.log(order);
      return order;
    } catch (error) {
      console.log('Error occured while creating order', error);
      throw new Error(`Error creating order: ${error.message}`);
    }
  }
}
