import {
  BadGatewayException,
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
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { Response } from 'express';
import { TravelConfirmationStatus } from 'src/common/enum/travelConfirmation.enum';
import { ErrorMessages } from 'src/common/enum/error.enum';

@Controller('booking')
export class BookingController {
  constructor(private _bookingService: BookingService) {}

  @Get('getAllBooked')
  async getAllBooked(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Res() res: Response,
  ) {
    try {
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
    } catch (error) {
      console.log('Error occure while fetch bookrd data from db', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, booked: [] });
    }
  }

  @Get('getSingleBookedPackage/:id')
  async getSingleBookedPackage(@Res() res: Response, @Param('id') id: string) {
    try {
      const result = await this._bookingService.getSingleBookedPackage(id);
      if (!result) {
        throw new InternalServerErrorException();
      }
      return res
        .status(HttpStatus.OK)
        .json({ success: true, bookedPackage: result });
    } catch (error) {
      console.log('error occured while fetch single booked data', error);
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Get('getAllBookingsForAgency')
  async getAllBookingsForAgency(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    try {
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
    } catch (error) {
      console.log('Error occured while fetching bookings for agency', error);
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ info: true, message: error.message, booking: [] });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message, booking: [] });
    }
  }

  @Patch('confirmBooking/:bookingId')
  async confirmBooking(
    @Res() res: Response,
    @Param('bookingId') bookingId: string,
    @Body('status') status: TravelConfirmationStatus,
  ) {
    try {
      const result = await this._bookingService.confirmBooking(
        bookingId,
        status,
      );
      if (result.modifiedCount > 0) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: 'Booking Confirmed' });
      }
      throw new InternalServerErrorException();
    } catch (error) {
      console.log('Error occured while confirm booking', error);
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.OK)
        .json({ success: false, message: error.message });
    }
  }

  @Patch('cancelBooking/:bookingId')
  async cancelBooking(
    @Res() res: Response,
    @Param('bookingId') bookingId: string,
    @Body('user') user: string,
  ) {
    try {
      const result = await this._bookingService.cancelBooking(user, bookingId);
      console.log('canceled', true);
      return result
        ? res
            .status(HttpStatus.OK)
            .json({ success: true, message: 'Booking canceled' })
        : res
            .status(HttpStatus.BAD_REQUEST)
            .json({ success: false, message: 'Unable to cancel booking' });
    } catch (error) {
      console.log('Error ocured', error);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'An error occurred',
      });
    }
  }
  @Get('byAgencies')
  async bookingsByAgencies(
    @Res() res: Response,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    try {
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
    } catch (error) {
      console.log('Error occured while fetching agencies bookings', error);
      if (error instanceof BadGatewayException) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: true, message: error.message, data: [] });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: true, message: error.message, data: [] });
    }
  }

  @Get('completed/:id')
  async completedBookings(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    try {
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
    } catch (error) {
      console.log('Error occured while fetching completed Bookings', error);
      if (error instanceof BadRequestException) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Get('started/:id')
  async startedBookings(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    try {
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
    } catch (error) {
      console.log('Error occured while fetching started Bookings', error);
      if (error instanceof BadRequestException) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }
  @Get('pending/:id')
  async pendingBookings(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    try {
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
    } catch (error) {
      console.log('Error occured while fetching pending Bookings', error);
      if (error instanceof BadRequestException) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Get('cancelled/:id')
  async cancelledBookings(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    try {
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
    } catch (error) {
      console.log('Error occured while fetching cancelled Bookings', error);
      if (error instanceof BadRequestException) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }
}
