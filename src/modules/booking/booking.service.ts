import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Package } from '../package/schema/package.schema';
import { Model } from 'mongoose';
import { Coupon } from '../coupon/schema/coupon.schema';
import { Booking } from './schema/booking.schema';
import { addDays } from 'date-fns';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private BookingModel: Model<Booking>,
    @InjectModel(Package.name) private PackageModel: Model<Package>,
    @InjectModel(Coupon.name) private CouponModel: Model<Coupon>,
  ) {}

  async saveBooking(
    userId: string,
    packageId: string,
    couponId: string,
    bookingData: any,
  ) {
    console.log('booking detail --->', bookingData);
    if (!bookingData || !packageId) {
      throw new NotFoundException(
        !bookingData ? 'Billing details not found' : 'Package ID not provided',
      );
    }

    let amount: number;
    let discountPrice: number = 0;
    const selectedPackage = await this.PackageModel.findById(packageId, {
      price: 1,
      days: 1,
    });
    if (!selectedPackage) throw new NotFoundException('Package not found');

    amount = Number(selectedPackage.price);
    if (couponId) {
      const selectedCoupon = await this.CouponModel.findById(couponId);
      if (!selectedCoupon) throw new NotFoundException('Coupon not found');

      if (selectedCoupon.discount_type === 'fixed') {
        discountPrice = selectedCoupon.discount_value || 0;
        amount -= discountPrice;
      } else if (selectedCoupon.discount_type === 'percentage') {
        let discount = (amount * (selectedCoupon.percentage || 0)) / 100;
        if (selectedCoupon.maxAmt && discount > selectedCoupon.maxAmt) {
          discount = selectedCoupon.maxAmt;
        }
        discountPrice = discount;
        amount -= discount;
      }
    }

    console.log('Final amount:', amount, 'Discount:', discountPrice);
    const startDate = new Date(bookingData.travelDates);
    const endDate = addDays(startDate, Number(selectedPackage.days));

    const newBooking = new this.BookingModel({
      package_id: packageId,
      user_id: userId,
      payment: 'online',
      start_date: startDate,
      end_date: endDate,
      travel_status: 'pending',
      confirmation: 'pending',
      coupon_id: couponId || null,
      discounted_price: discountPrice,
      total_price: amount,
      peoples: bookingData.travelers,
      billing_details: {
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
      },
    });

    try {
      const savedBooking = await newBooking.save();
      console.log('New booking saved:', savedBooking);
      return savedBooking;
    } catch (error) {
      console.error('Error saving booking:', error);
      throw new InternalServerErrorException('Failed to save booking');
    }
  }
}
