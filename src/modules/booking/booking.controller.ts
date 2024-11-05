import {
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

@Controller('booking')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Get('getAllBooked')
  async getAllBooked(@Req() req: Request, @Res() res: Response) {
    try {
      const bookedPackages = await this.bookingService.getAllBookedPackages(
        req['user'].sub,
      );
      return res
        .status(HttpStatus.OK)
        .json({ success: true, booked: bookedPackages });
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
      const result = await this.bookingService.getSingleBookedPackage(id);
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
      const result = await this.bookingService.getAllBookingsForAgency(
        req['agency'].sub,
        page,
        limit,
      );
      if (result) {
        return res.status(HttpStatus.OK).json({
          success: true,
          booking: result.packages,
          totalItems: result.totalItems,
          currentPage: result.currentPage,
        });
      }
    } catch (error) {
      console.log('Error occured while fetching bookings for agency', error);
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: true, booking: [] });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: true, booking: [] });
    }
  }

  @Patch('confirmBooking/:bookingId')
  async confirmBooking(
    @Res() res: Response,
    @Param('bookingId') bookingId: string,
    @Body('status') status: TravelConfirmationStatus,
  ) {
    try {
      const result = await this.bookingService.confirmBooking(
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
      const result = await this.bookingService.cancelBooking(user, bookingId);
      return result
        ? res
            .status(HttpStatus.OK)
            .json({ success: true, message: 'Booking canceled' })
        : res
            .status(HttpStatus.BAD_REQUEST)
            .json({ success: false, message: 'Unable to cancel booking' });
    } catch (error) {
      console.log('------------------------->', error);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'An error occurred',
      });
    }
  }
}
