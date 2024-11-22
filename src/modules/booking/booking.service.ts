import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Package } from '../package/schema/package.schema';
import { Model, Types } from 'mongoose';
import { Coupon } from '../coupon/schema/coupon.schema';
import { Booking } from './schema/booking.schema';
import { addDays } from 'date-fns';
import { WalletService } from '../wallet/wallet.service';
import { TravelStatus } from 'src/common/enum/travelStatus.enum';
import { TravelConfirmationStatus } from 'src/common/enum/travelConfirmation.enum';
import { Transaction } from '../wallet/schema/wallet.schema';
import { TransactionType } from 'src/common/enum/transactionType.enum';
import { ErrorMessages } from 'src/common/enum/error.enum';
import { IOffer } from 'src/common/interfaces/offer.interface';
import { DiscountType } from 'src/common/enum/discountType.enum';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private _BookingModel: Model<Booking>,
    @InjectModel(Package.name) private _PackageModel: Model<Package>,
    @InjectModel(Coupon.name) private _CouponModel: Model<Coupon>,
    private _WalletService: WalletService,
  ) {}

  async saveBooking(
    userId: string,
    packageId: string,
    agencyId: string,
    couponId: string,
    bookingData: any,
  ) {
    if (!bookingData || !packageId || !agencyId) {
      throw new NotFoundException(
        !bookingData
          ? 'Billing details not found'
          : !packageId
            ? 'Package ID not provided'
            : 'Agency ID not found',
      );
    }

    let amount: number = Number(process.env.SERVICE_CHARGE);
    let discountPrice: number = 0;
    const selectedPackage = await this._PackageModel
      .findById(packageId, {
        price: 1,
        days: 1,
      })
      .populate('offerId');
    amount = Number(selectedPackage.price);
    if (!selectedPackage) throw new NotFoundException('Package not found');
    if (selectedPackage.offerId) {
      const offer = selectedPackage.offerId as IOffer;
      if (offer.discount_type === DiscountType.FIXED) {
        amount = amount - offer.discount_value;
      } else if (offer.discount_type === DiscountType.PERCENTAGE) {
        amount = amount * (offer.percentage / 100);
      }
    }
    if (couponId) {
      const selectedCoupon = await this._CouponModel.findById(couponId);
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

    const startDate = new Date(bookingData.travelDates);
    const endDate = addDays(startDate, Number(selectedPackage.days));
    if (amount <= 50) {
      amount = 50;
    }
    const newBooking = new this._BookingModel({
      package_id: new Types.ObjectId(packageId),
      user_id: new Types.ObjectId(userId),
      agency_id: new Types.ObjectId(agencyId),
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
      if (couponId) {
        await Promise.all([
          newBooking.save(),
          this._CouponModel.updateOne(
            { _id: couponId },
            {
              $push: { used: userId },
            },
          ),
        ]);
        return true;
      }
      await newBooking.save();
      return true;
    } catch (error) {
      console.error('Error saving booking:', error);
      throw new InternalServerErrorException('Failed to save booking');
    }
  }

  async getAllBookedPackages(userId: string, page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const [bookedPackages, bookedPackageCount] = await Promise.all([
        this._BookingModel
          .aggregate([
            {
              $match: {
                user_id: new Types.ObjectId(userId),
                $or: [
                  { travel_status: TravelStatus.PENDING },
                  { travel_status: TravelStatus.STARTED },
                ],
              },
            },
            {
              $lookup: {
                from: 'packages',
                localField: 'package_id',
                foreignField: '_id',
                as: 'package',
              },
            },
            { $unwind: '$package' },
            {
              $lookup: {
                from: 'agencies',
                localField: 'package.agencyId',
                foreignField: '_id',
                as: 'agency',
              },
            },
            { $unwind: '$agency' },
            {
              $lookup: {
                from: 'categories',
                localField: 'package.category',
                foreignField: '_id',
                as: 'category',
              },
            },
            { $unwind: '$category' },
            {
              $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user',
              },
            },
            {
              $unwind: '$user',
            },
          ])
          .skip(skip)
          .limit(limit),
        this._BookingModel.countDocuments({
          user_id: new Types.ObjectId(userId),
          $or: [
            { travel_status: TravelStatus.PENDING },
            { travel_status: TravelStatus.STARTED },
          ],
        }),
      ]);
      return {
        bookedPackageCount,
        bookedPackages,
        page,
      };
    } catch (error) {
      console.log('Error occured while fetch booking', error);
      throw new InternalServerErrorException();
    }
  }

  async getSingleBookedPackage(bookingId: string) {
    if (!bookingId) throw new NotFoundException('Cant find booking data');
    return await this._BookingModel
      .findOne({
        _id: bookingId,
        travel_status: { $ne: 'completed' },
      })
      .populate(['package_id', 'user_id', 'agency_id']);
  }

  async getAllBookingsForAgency(agencyId: string, page: number, limit: number) {
    console.log('limit', limit);
    console.log('page', page);
    const skip = (page - 1) * limit;
    const [bookings, bookingCount] = await Promise.all([
      this._BookingModel
        .find({ agency_id: new Types.ObjectId(agencyId) })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate(['agency_id', 'user_id', 'package_id']),
      this._BookingModel.countDocuments({
        agency_id: new Types.ObjectId(agencyId),
      }),
    ]);
    if (bookings.length == 0)
      throw new NotFoundException(ErrorMessages.BOOKING_NOT_FOUND);
    return {
      bookings,
      totalItems: bookingCount,
      currentPage: page,
    };
  }

  async confirmBooking(bookingId: string, status: TravelConfirmationStatus) {
    if (!bookingId || !status)
      throw new NotFoundException(
        !bookingId ? 'Cant find bookingId' : 'Cant find status',
      );
    return await this._BookingModel.updateOne(
      { _id: bookingId },
      { $set: { confirmation: status } },
    );
  }

  async cancelBooking(userRole: string, bookingId: string): Promise<boolean> {
    try {
      const bookedPackage = await this._BookingModel.findById(bookingId).exec();
      console.log('booked ---->', bookedPackage);
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
          this._BookingModel.updateOne(
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
        console.log('refund amount', refundAmount);
        await Promise.all([
          this._BookingModel.updateOne(
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
          error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  private _calculateRefund(price: string, createdAt: Date): number {
    const today = Date.now();
    const bookedDate = createdAt.getTime();
    const diffInHours = (today - bookedDate) / (1000 * 60 * 60);
    console.log('houres --->', diffInHours);
    if (diffInHours <= 24) {
      return Number(price);
    } else if (diffInHours >= 72 && diffInHours <= 168) {
      return Number(price) * 0.5;
    } else {
      return 0;
    }
  }
}
