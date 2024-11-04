import {
  BadRequestException,
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
import { WalletService } from '../wallet/wallet.service';
import { TravelStatus } from 'src/common/enum/travelStatus.enum';
import { TravelConfirmationStatus } from 'src/common/enum/travelConfirmation.enum';
import { Transaction } from '../wallet/schema/wallet.schema';
import { TransactionType } from 'src/common/enum/transactionType.enum';
import { ErrorMessages } from 'src/common/enum/error.enum';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private BookingModel: Model<Booking>,
    @InjectModel(Package.name) private PackageModel: Model<Package>,
    @InjectModel(Coupon.name) private CouponModel: Model<Coupon>,
    private _WalletService: WalletService,
  ) {}

  async saveBooking(
    userId: string,
    packageId: string,
    agencyId: string,
    couponId: string,
    bookingData: any,
  ) {
    console.log('booking detail --->', bookingData);
    if (!bookingData || !packageId || !agencyId) {
      throw new NotFoundException(
        !bookingData
          ? 'Billing details not found'
          : !packageId
            ? 'Package ID not provided'
            : 'Agency ID not found',
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
      agency_id: agencyId,
      payment: 'online',
      start_date: startDate,
      end_date: endDate,
      travel_status: TravelStatus.PENDING,
      confirmation: TravelConfirmationStatus.PENDING,
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

  async getAllBookedPackages(userId: string) {
    return await this.BookingModel.find({
      user_id: userId,
      travel_status: { $ne: 'completed' },
    }).populate(['user_id', 'package_id', 'agency_id', 'package_id.category']);
  }

  async getSingleBookedPackage(bookingId: string) {
    if (!bookingId) throw new NotFoundException('Cant find booking data');
    return await this.BookingModel.findOne({
      _id: bookingId,
      travel_status: { $ne: 'completed' },
    }).populate(['package_id', 'user_id', 'agency_id']);
  }

  async getAllBookingsForAgency(agencyId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const packages = await this.BookingModel.find({ agency_id: agencyId })
      .skip(skip)
      .limit(limit)
      .populate(['agency_id', 'user_id', 'package_id    ']);
    if (packages.length == 0) throw new NotFoundException('Cant find packages');
    return {
      packages,
      totalItems: packages.length,
      currentPage: page,
    };
  }

  async confirmBooking(bookingId: string, status: TravelConfirmationStatus) {
    console.log('body----------->>', status);
    if (!bookingId || !status)
      throw new NotFoundException(
        !bookingId ? 'Cant find bookingId' : 'Cant find status',
      );
    return await this.BookingModel.updateOne(
      { _id: bookingId },
      { $set: { confirmation: status } },
    );
  }

  async cancelBooking(userRole: string, bookingId: string): Promise<boolean> {
    try {
      const bookedPackage = await this.BookingModel.findById(bookingId).exec();
      if (!bookedPackage) {
        throw new NotFoundException(ErrorMessages.BOOKING_NOT_FOUND);
      }

      const userWallet = await this._WalletService.getOrCreateUserWallet(
        bookedPackage.user_id,
      );
      if (!userWallet) {
        throw new BadRequestException(ErrorMessages.WALLET_NOT_FOUND);
      }

      const newTransaction: Transaction = {
        amount: Number(bookedPackage.total_price),
        description: 'Booking canceled',
        type: TransactionType.CREDIT,
      };

      if (userRole === 'agency') {
        await Promise.all([
          this.BookingModel.updateOne(
            { _id: bookingId },
            {
              $set: {
                travel_status: TravelStatus.CANCELLED,
                confirmation: TravelConfirmationStatus.REJECTED,
              },
            },
          ),
          this._WalletService.updateBalanceAndTransaction(
            bookedPackage.user_id,
            userWallet.balance + Number(bookedPackage.total_price),
            newTransaction,
          ),
        ]);
        return true;
      } else if (userRole === 'user') {
        const refundAmount = this._calculateRefund(
          bookedPackage.total_price,
          bookedPackage.createdAt,
        );
        await Promise.all([
          this.BookingModel.updateOne(
            { _id: bookingId },
            {
              $set: {
                travel_status: TravelStatus.CANCELLED,
                confirmation: TravelConfirmationStatus.REJECTED,
              },
            },
          ),
          this._WalletService.updateBalanceAndTransaction(
            bookedPackage.user_id,
            userWallet.balance + refundAmount,
            { ...newTransaction, amount: refundAmount },
          ),
        ]);
        return true;
      } else {
        throw new BadRequestException(
          'User role not authorized to cancel booking',
        );
      }
    } catch (error) {
      console.error('Error cancelling booking:', error.message);
      if (error.message === ErrorMessages.WALLET_CREATION_FAILED) {
        throw new BadRequestException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(
          ErrorMessages.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  private _calculateRefund(price: string, createdAt: Date): number {
    const today = Date.now();
    const bookedDate = createdAt.getTime();
    const diffInHours = (today - bookedDate) / (1000 * 60 * 60);

    if (diffInHours <= 24) {
      return Number(price);
    } else if (diffInHours >= 72 && diffInHours <= 168) {
      return Number(price) * 0.5;
    } else {
      return 0;
    }
  }
}
