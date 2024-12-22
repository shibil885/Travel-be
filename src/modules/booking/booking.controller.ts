import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { Response } from 'express';
import { TravelConfirmationStatus } from 'src/common/enum/travelConfirmation.enum';
import { ErrorMessages } from 'src/common/enum/error.enum';
import { SocketGateway } from '../socket/gateway/socket.gateway';
import { AllExceptionsFilter } from 'src/common/filter/ecception.filter';
import { TravelStatus } from 'src/common/enum/travelStatus.enum';

@Controller('booking')
export class BookingController {
  constructor(
    private _bookingService: BookingService,
    private _socket: SocketGateway,
  ) {}

  @Get('getAllBooked')
  @UseFilters(AllExceptionsFilter)
  async getAllBooked(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Res() res: Response,
  ) {
    if (!page || !limit)
      throw new BadRequestException(
        !page ? 'Page not provided' : 'Limit not provided',
      );
    const response = await this._bookingService.getAllBookedPackages(
      req['user'].sub,
      Number(page),
      Number(limit),
    );
    if (response.bookedPackages.length > 0) {
      return res.status(HttpStatus.OK).json({
        success: true,
        booked: response.bookedPackages,
        totalItems: response.bookedPackageCount,
        currentPage: response.page,
      });
    }
    return res.status(HttpStatus.OK).json({
      info: true,
      booked: [],
      totalItems: response.bookedPackageCount,
      currentPage: response.page,
    });
  }

  @Get('travelHistory')
  @UseFilters(AllExceptionsFilter)
  async getTravelHistory(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Res() res: Response,
  ) {
    if (!page || !limit)
      throw new BadRequestException(
        !page ? 'Page not provided' : 'Limit not provided',
      );
    const response = await this._bookingService.getTravelHistory(
      req['user'].sub,
      Number(page),
      Number(limit),
    );
    if (response.bookedPackages.length > 0) {
      return res.status(HttpStatus.OK).json({
        success: true,
        history: response.bookedPackages,
        totalItems: response.bookedPackageCount,
        currentPage: response.page,
      });
    }
    return res.status(HttpStatus.OK).json({
      info: true,
      history: [],
      totalItems: response.bookedPackageCount,
      currentPage: response.page,
    });
  }

  @Get('getSingleBookedPackage/:id')
  @UseFilters(AllExceptionsFilter)
  async getSingleBookedPackage(@Res() res: Response, @Param('id') id: string) {
    const result = await this._bookingService.getSingleBookedPackage(id);
    if (!result) {
      throw new InternalServerErrorException();
    }
    return res
      .status(HttpStatus.OK)
      .json({ success: true, bookedPackage: result });
  }

  @Get('getAllBookingsForAgency')
  @UseFilters(AllExceptionsFilter)
  async getAllBookingsForAgency(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const result = await this._bookingService.getAllBookingsForAgency(
      req['agency'].sub,
      page,
      limit,
    );
    if (result.bookings.length > 0) {
      return res.status(HttpStatus.OK).json({
        success: true,
        booking: result.bookings,
        totalItems: result.totalItems,
        currentPage: result.currentPage,
      });
    }
    throw new NotFoundException(ErrorMessages.BOOKING_NOT_FOUND);
  }

  @Patch('confirmBooking/:bookingId')
  @UseFilters(AllExceptionsFilter)
  async confirmBooking(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bookingId') bookingId: string,
    @Body('status') status: TravelConfirmationStatus,
  ) {
    const result = await this._bookingService.confirmBooking(
      bookingId,
      status,
      req['agency']['sub'],
    );
    if (result.updateResult.modifiedCount > 0 && result.notificationResult) {
      this._socket.bookingConfirmed(result.notificationResult.to_id.toString());
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: 'Booking Confirmed' });
    }
    throw new InternalServerErrorException();
  }

  @Patch('cancelBooking/:bookingId')
  @UseFilters(AllExceptionsFilter)
  async cancelBooking(
    @Res() res: Response,
    @Param('bookingId') bookingId: string,
    @Body('user') user: string,
  ) {
    const result = await this._bookingService.cancelBooking(user, bookingId);
    this._socket.bookingCancelled(result.user_id.toString());
    return result
      ? res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Booking canceled' })
      : res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: 'Unable to cancel booking' });
  }

  @Get('byAgencies')
  @UseFilters(AllExceptionsFilter)
  async bookingsByAgencies(
    @Res() res: Response,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const result = await this._bookingService.getAgenciesAndBookingData(
      Number(page),
      Number(limit),
    );
    if (result) {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'List of bookings',
        data: result.bookingData,
        totalItems: result.totalCount,
        currentPage: result.page,
      });
    }
    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: 'List of bookings', data: [] });
  }

  @Get('completed/:id')
  @UseFilters(AllExceptionsFilter)
  async completedBookings(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    if (!limit || !id || !page)
      throw new BadRequestException(
        !limit
          ? 'Limit not provided'
          : !id
            ? 'Agency id not provided'
            : 'Limit not provided',
      );
    const result = await this._bookingService.getCompletedBookings(
      id,
      Number(page),
      Number(limit),
    );
    if (result.completedBookingsCount > 0) {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'List of completed bookings',
        bookings: result.completedBookings,
        totalItems: result.completedBookingsCount,
        page: result.page,
      });
    } else {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'List of completed bookings',
        bookings: [],
        totalItems: 0,
        page: 0,
      });
    }
  }

  @Get('started/:id')
  @UseFilters(AllExceptionsFilter)
  async startedBookings(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    if (!limit || !id || !page)
      throw new BadRequestException(
        !limit
          ? 'Limit not provided'
          : !id
            ? 'Agency id not provided'
            : 'Limit not provided',
      );
    const result = await this._bookingService.getStartedBookings(
      id,
      Number(page),
      Number(limit),
    );
    if (result.startedBookingsCount > 0) {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'List of started bookings',
        bookings: result.startedBookings,
        totalItems: result.startedBookingsCount,
        page: result.page,
      });
    } else {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'List of started bookings',
        bookings: [],
        totalItems: 0,
        page: 0,
      });
    }
  }
  @Get('pending/:id')
  @UseFilters(AllExceptionsFilter)
  async pendingBookings(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    if (!limit || !id || !page)
      throw new BadRequestException(
        !limit
          ? 'Limit not provided'
          : !id
            ? 'Agency id not provided'
            : 'Limit not provided',
      );
    const result = await this._bookingService.getPendingBookings(
      id,
      Number(page),
      Number(limit),
    );
    if (result.pendingBookingsCount > 0) {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'List of pending bookings',
        bookings: result.pendingBookings,
        totalItems: result.pendingBookingsCount,
        page: result.page,
      });
    } else {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'List of pending bookings',
        bookings: [],
        totalItems: 0,
        page: 0,
      });
    }
  }

  @Get('cancelled/:id')
  @UseFilters(AllExceptionsFilter)
  async cancelledBookings(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    if (!limit || !id || !page)
      throw new BadRequestException(
        !limit
          ? 'Limit not provided'
          : !id
            ? 'Agency id not provided'
            : 'Limit not provided',
      );
    const result = await this._bookingService.getCancelledBookings(
      id,
      Number(page),
      Number(limit),
    );
    if (result.cancelledBookingsCount > 0) {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'List of cancelled bookings',
        bookings: result.cancelledBookings,
        totalItems: result.cancelledBookingsCount,
        page: result.page,
      });
    } else {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'List of cancelled bookings',
        bookings: [],
        totalItems: 0,
        page: 0,
      });
    }
  }

  @Patch('changestatus/:id')
  @UseFilters(AllExceptionsFilter)
  async changeTravelStatus(
    @Res() res: Response,
    @Body('status') status: TravelStatus,
    @Param('id') bookingId: string,
  ) {
    const response = await this._bookingService.changeStatus(bookingId, status);
    return response.isModified
      ? res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Status changed' })
      : res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: true, message: 'Somthing went wrong' });
  }
}
