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
import { BookingDataDto } from 'src/common/dtos/boookingData.gto';
import { Agency } from '../agency/schema/agency.schema';
import { Admin } from '../admin/schema/admin.schema';
import { Notification } from '../notification/schema/notification.schema';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private _BookingModel: Model<Booking>,
    @InjectModel(Package.name) private _PackageModel: Model<Package>,
    @InjectModel(Coupon.name) private _CouponModel: Model<Coupon>,
    @InjectModel(Agency.name) private _AgencyModel: Model<Agency>,
    @InjectModel(Admin.name) private _AdminModel: Model<Admin>,
    @InjectModel(Notification.name)
    private _NotificationModel: Model<Notification>,
    private _WalletService: WalletService,
    private _notificationService: NotificationService,
  ) {}

  private _calculateRefund(price: string, createdAt: Date): number {
    const today = Date.now();
    const bookedDate = createdAt.getTime();
    const diffInHours = (today - bookedDate) / (1000 * 60 * 60);
    console.log('hours --->', diffInHours);
    if (diffInHours <= 24) {
      return Number(price);
    } else if (diffInHours >= 72 && diffInHours <= 168) {
      return Number(price) * 0.5;
    } else {
      return 0;
    }
  }

  async saveBooking(
    userId: string,
    packageId: string,
    agencyId: string,
    couponId: string,
    bookingData: BookingDataDto,
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
    let discountPrice: number = 0;

    const selectedPackage = await this._PackageModel
      .findById(packageId, {
        price: 1,
        days: 1,
      })
      .populate('offerId');
    if (!selectedPackage) throw new NotFoundException('Package not found');
    let amount = Number(selectedPackage.price);
    if (selectedPackage.offerId) {
      const offer = selectedPackage.offerId as IOffer;
      if (offer.discount_type === DiscountType.FIXED) {
        amount -= offer.discount_value;
      } else if (offer.discount_type === DiscountType.PERCENTAGE) {
        amount *= 1 - offer.percentage / 100;
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
    const admin = await this._AdminModel.find();
    const adminWallet = await this._WalletService.getOrCreateUserWallet(
      admin[0]._id,
    );
    try {
      const notifications = [
        {
          fromId: new Types.ObjectId(userId),
          fromModel: 'User',
          toId: new Types.ObjectId(agencyId),
          toModel: 'Agency',
          title: 'New Booking Alert',
          description: `A new package has been booked by a user. Please confirm the booking.`,
          type: 'info',
          priority: 2,
        },
        {
          fromId: new Types.ObjectId(userId),
          fromModel: 'User',
          toId: new Types.ObjectId(admin[0]._id),
          toModel: 'Admin',
          title: 'New Booking Notification',
          description: `A user has booked a new package. Booking charges have been credited to your wallet.`,
          type: 'success',
          priority: 1,
        },
      ];

      await Promise.all([
        newBooking.save(),
        ...notifications.map((notification) =>
          this._notificationService.createNotification(notification),
        ),
      ]);
      const newTransactionForAdmin: Transaction = {
        amount: Number(process.env.SERVICE_CHARGE),
        description: 'New booking added',
        type: TransactionType.CREDIT,
      };
      await this._WalletService.updateBalanceAndTransaction(
        admin[0]._id,
        adminWallet.balance + Number(process.env.SERVICE_CHARGE),
        newTransactionForAdmin,
      );
      if (couponId) {
        await Promise.all([
          newBooking.save(),
          this._CouponModel.updateOne(
            { _id: couponId },
            {
              $push: { used: userId },
            },
          ),
          ...notifications.map((notification) =>
            this._notificationService.createNotification(notification),
          ),
        ]);
        return { agencyId: agencyId, adminId: admin[0]._id };
      }
      return { agencyId: agencyId, adminId: admin[0]._id };
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
            {
              $lookup: {
                from: 'reviewforpackages',
                localField: 'package_id',
                foreignField: 'packageId',
                as: 'ratingAndReview',
              },
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

  async getTravelHistory(userId: string, page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const [bookedPackages, bookedPackageCount] = await Promise.all([
        this._BookingModel
          .aggregate([
            {
              $match: {
                user_id: new Types.ObjectId(userId),
                travel_status: TravelStatus.COMPLETED,
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
            {
              $lookup: {
                from: 'reviewforpackages',
                localField: 'package_id',
                foreignField: 'packageId',
                as: 'ratingAndReview',
              },
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
      })
      .sort({ createdAt: -1 })
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

  async confirmBooking(
    bookingId: string,
    status: TravelConfirmationStatus,
    agencyId: string,
  ) {
    if (!bookingId || !status)
      throw new NotFoundException(
        !bookingId ? 'Cant find bookingId' : 'Cant find status',
      );
    const bookings = await this._BookingModel.findById(bookingId);
    const newNotification = new this._NotificationModel({
      from_id: agencyId,
      from_model: 'Agency',
      to_id: bookings.user_id,
      to_model: 'User',
      title: 'Your booking has been confirmed!',
      description: `The booking has been successfully confirmed and verified.`,
      type: 'info',
      priority: 2,
    });
    const [notificationResult, updateResult] = await Promise.all([
      newNotification.save(),
      this._BookingModel.updateOne(
        { _id: bookingId },
        { $set: { confirmation: status } },
      ),
    ]);

    return { notificationResult, updateResult };
  }

  async cancelBooking(userRole: string, bookingId: string) {
    try {
      const bookedPackage = await this._BookingModel.findById(bookingId).exec();
      if (!bookedPackage) {
        throw new NotFoundException(ErrorMessages.BOOKING_NOT_FOUND);
      }
      const userWallet = await this._WalletService.getOrCreateUserWallet(
        bookedPackage.user_id,
      );
      if (!userWallet) {
        throw new BadRequestException(ErrorMessages.WALLET_NOT_FOUND);
      }
      const admin = await this._AdminModel.find();
      const adminWallet = await this._WalletService.getOrCreateUserWallet(
        admin[0]._id,
      );
      if (!adminWallet) {
        throw new BadRequestException(ErrorMessages.WALLET_NOT_FOUND);
      }

      const newTransaction: Transaction = {
        amount: Number(bookedPackage.total_price),
        description: 'Booking canceled',
        type: TransactionType.CREDIT,
      };

      const senderId =
        userRole === 'agency' ? bookedPackage.agency_id : bookedPackage.user_id;
      const senderModel = userRole === 'agency' ? 'Agency' : 'User';

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
          this._NotificationModel.create({
            from_id: senderId,
            from_model: senderModel,
            to_id: bookedPackage.user_id,
            to_model: 'User',
            title: 'Booking Cancelled by Agency',
            description: `Your booking has been cancelled by the agency. Full amount will be refunded to your wallet.`,
            type: 'alert',
            priority: 2,
          }),
        ]);

        const newTransactionForAdmin: Transaction = {
          amount: Number(process.env.SERVICE_CHARGE),
          description: 'Booking canceled',
          type: TransactionType.DEBIT,
        };
        await this._WalletService.updateBalanceAndTransaction(
          admin[0]._id,
          adminWallet.balance - Number(process.env.SERVICE_CHARGE),
          newTransactionForAdmin,
        );
        return bookedPackage;
      } else if (userRole === 'user') {
        const refundAmount = this._calculateRefund(
          bookedPackage.total_price,
          bookedPackage.createdAt,
        );
        await this._BookingModel.updateOne(
          { _id: bookingId },
          {
            $set: {
              travel_status: TravelStatus.CANCELLED,
              confirmation: TravelConfirmationStatus.REJECTED,
            },
          },
        );

        if (refundAmount) {
          await this._WalletService.updateBalanceAndTransaction(
            bookedPackage.user_id,
            userWallet.balance + refundAmount,
            { ...newTransaction, amount: refundAmount },
          );
        }

        await this._NotificationModel.create({
          from_id: senderId,
          from_model: senderModel,
          to_id: bookedPackage.user_id,
          to_model: 'User',
          title: 'Booking Cancelled',
          description: `Your booking has been cancelled. ${refundAmount > 0 ? `A refund of ${refundAmount} has been processed to your wallet.` : ''}`,
          type: 'info',
          priority: 2,
        });

        const today = Date.now();
        const bookedDate = bookedPackage.createdAt.getTime();
        const diffInHours = (today - bookedDate) / (1000 * 60 * 60);
        const fullRefund = diffInHours <= 24;
        if (fullRefund) {
          const newTransactionForAdmin: Transaction = {
            amount: Number(process.env.SERVICE_CHARGE),
            description: 'Booking canceled',
            type: TransactionType.DEBIT,
          };
          await this._WalletService.updateBalanceAndTransaction(
            admin[0]._id,
            adminWallet.balance - Number(process.env.SERVICE_CHARGE),
            newTransactionForAdmin,
          );
        }
        return bookedPackage;
      } else {
        throw new BadRequestException(
          'User role not authorized to cancel booking',
        );
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
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

  async getAgenciesAndBookingData(page: number, limit: number) {
    if (!page || !limit)
      throw new BadRequestException(
        !page ? 'Page not provided' : 'Limit not provided',
      );
    const skip = (page - 1) * limit;
    const [packagesByAgency, totalCount] = await Promise.all([
      this._AgencyModel
        .aggregate([
          {
            $lookup: {
              from: 'bookings',
              localField: '_id',
              foreignField: 'agency_id',
              as: 'bookings',
            },
          },
        ])
        .skip(skip)
        .limit(limit),
      this._AgencyModel.countDocuments(),
    ]);
    const bookingData = [];
    packagesByAgency.forEach((agency) => {
      const data = {
        total: agency.bookings.length,
        completed: 0,
        started: 0,
        canceled: 0,
        pending: 0,
      };
      agency.bookings.forEach((booking) => {
        if (booking.travel_status === TravelStatus.COMPLETED) {
          data[TravelStatus.COMPLETED]++;
        } else if (booking.travel_status === TravelStatus.PENDING) {
          data[TravelStatus.PENDING]++;
        } else if (booking.travel_status === TravelStatus.STARTED) {
          data[TravelStatus.STARTED]++;
        } else if (booking.travel_status === TravelStatus.CANCELLED) {
          data[TravelStatus.CANCELLED]++;
        }
      });
      bookingData.push({ ...data, name: agency.name, id: agency._id });
    });
    return { bookingData, totalCount, page };
  }

  async getCancelledBookings(agencyId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [cancelledBookings, cancelledBookingsCount] = await Promise.all([
      this._BookingModel
        .find({
          agency_id: new Types.ObjectId(agencyId),
          travel_status: TravelStatus.CANCELLED,
        })
        .skip(skip)
        .limit(limit)
        .populate([
          { path: 'agency_id', select: 'name' },
          { path: 'package_id' },
          { path: 'user_id' },
        ]),
      this._BookingModel.countDocuments({
        agency_id: new Types.ObjectId(agencyId),
        travel_status: TravelStatus.CANCELLED,
      }),
    ]);

    return {
      cancelledBookings,
      cancelledBookingsCount,
      page,
    };
  }
  async getCompletedBookings(agencyId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [completedBookings, completedBookingsCount] = await Promise.all([
      this._BookingModel
        .find({
          agency_id: new Types.ObjectId(agencyId),
          travel_status: TravelStatus.COMPLETED,
        })
        .skip(skip)
        .limit(limit)
        .populate([
          { path: 'agency_id', select: 'name' },
          { path: 'package_id' },
          { path: 'user_id' },
        ]),
      this._BookingModel.countDocuments({
        agency_id: new Types.ObjectId(agencyId),
        travel_status: TravelStatus.COMPLETED,
      }),
    ]);
    console.log('------>', completedBookings);

    return {
      completedBookings,
      completedBookingsCount,
      page,
    };
  }
  async getPendingBookings(agencyId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [pendingBookings, pendingBookingsCount] = await Promise.all([
      this._BookingModel
        .find({
          agency_id: new Types.ObjectId(agencyId),
          travel_status: TravelStatus.PENDING,
        })
        .skip(skip)
        .limit(limit)
        .populate([
          { path: 'agency_id', select: 'name' },
          { path: 'package_id' },
          { path: 'user_id' },
        ]),
      this._BookingModel.countDocuments({
        agency_id: new Types.ObjectId(agencyId),
        travel_status: TravelStatus.PENDING,
      }),
    ]);

    return {
      pendingBookings,
      pendingBookingsCount,
      page,
    };
  }
  async getStartedBookings(agencyId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [startedBookings, startedBookingsCount] = await Promise.all([
      this._BookingModel
        .find({
          agency_id: new Types.ObjectId(agencyId),
          travel_status: TravelStatus.STARTED,
        })
        .skip(skip)
        .limit(limit)
        .populate([
          { path: 'agency_id', select: 'name' },
          { path: 'package_id' },
          { path: 'user_id' },
        ]),
      this._BookingModel.countDocuments({
        agency_id: new Types.ObjectId(agencyId),
        travel_status: TravelStatus.STARTED,
      }),
    ]);

    return {
      startedBookings,
      startedBookingsCount,
      page,
    };
  }

  changeStatus(bookingId: string, status: TravelStatus) {
    if (!bookingId || !status) throw new BadRequestException('Invalid inputs');
    return this._BookingModel.findByIdAndUpdate(new Types.ObjectId(bookingId), {
      travel_status: status,
    });
  }
}
