// import {
//   Body,
//   Controller,
//   Get,
//   HttpStatus,
//   Patch,
//   Post,
//   Req,
//   Res,
//   UploadedFile,
//   UseInterceptors,
// } from '@nestjs/common';
// import { AgencyService } from './agency.service';
// import { Request, Response } from 'express';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { CreateResponse } from 'src/common/response/createResponse';

// @Controller('agency')
// export class AgencyController {
//   constructor(private _agencyService: AgencyService) {}

//   @Get()
//   async getAllAgencies(@Res() res: Response) {
//     const { agencies, message } = await this._agencyService.getAllAgencies();
//     CreateResponse.success(res, { agencies }, message);
//   }

//   @Post('signup')
//   @UseInterceptors(FileInterceptor('document'))
//   signup(
//     @Res() res: Response,
//     @Body() agencyData: FormData,
//     @UploadedFile() file: Express.Multer.File,
//   ) {
//     return this._agencyService.signup(res, agencyData, file);
//   }

//   @Patch('logout')
//   async agencyLogout(@Req() req: Request, @Res() res: Response) {
//     res.clearCookie('access_token', {
//       path: '/',
//       httpOnly: true,
//       secure: true,
//       sameSite: 'strict',
//     });
//     res.clearCookie('refresh_token', {
//       path: '/',
//       httpOnly: true,
//       secure: true,
//       sameSite: 'strict',
//     });

//     return res.status(HttpStatus.OK).json({
//       message: 'Successfully logged out',
//       success: true,
//     });
//   }

//   @Post('isExistingMail')
//   findEmail(@Res() res: Response, @Body() body) {
//     return this._agencyService.findEmail(res, body.email);
//   }
//   @Post('isExistingName')
//   findName(@Res() res: Response, @Body() body) {
//     return this._agencyService.findName(res, body.name);
//   }
//   @Get('isConfirmed')
//   isConfirmed(@Req() req: Request, @Res() res: Response) {
//     return this._agencyService.isConfirmed(req, res);
//   }
// }

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AgencyService } from './agency.service';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ResponseMessage,
  ApiResponse,
} from 'src/common/decorators/response.decorator';
import { CreateAgencyDto } from 'src/common/dtos/createAgency.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CheckEmailDto } from 'src/common/dtos/check-mail.dto';
import { CheckNameDto } from 'src/common/dtos/check-name.dto';
import { AgencySuccessMessages } from 'src/common/constants/messages';

@Controller('agency')
export class AgencyController {
  constructor(private readonly _agencyService: AgencyService) {}

  @Get()
  @ResponseMessage('Agencies fetched successfully')
  async getAllAgencies(@Query() paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    return await this._agencyService.getAllAgencies(page, limit);
  }

  @Post()
  @UseInterceptors(FileInterceptor('document'))
  @ApiResponse('Agency created successfully', HttpStatus.CREATED)
  async createAgency(
    @Body() createAgencyDto: CreateAgencyDto,
    @UploadedFile() document: Express.Multer.File,
  ) {
    return await this._agencyService.createAgency(createAgencyDto, document);
  }

  @Post('check-email')
  @ResponseMessage(AgencySuccessMessages.EMAIL_AVAILABILITY_CHECKED)
  async checkEmailExists(@Body() checkEmailDto: CheckEmailDto) {
    return await this._agencyService.checkEmailExists(checkEmailDto.email);
  }

  @Post('check-name')
  @ResponseMessage(AgencySuccessMessages.NAME_AVAILABILITY_CHECKED)
  async checkNameExists(@Body() checkNameDto: CheckNameDto) {
    return await this._agencyService.checkNameExists(checkNameDto.name);
  }

  @Get('confirmation-status')
  @ResponseMessage('Agency confirmation status retrieved')
  async checkConfirmationStatus(@Req() req: Request) {
    const agencyEmail = req['agency']?.email;
    if (!agencyEmail) {
      throw new NotFoundException('Agency email not found in request');
    }
    return await this._agencyService.checkAgencyConfirmation(agencyEmail);
  }

  @Post('logout')
  @ResponseMessage('Successfully logged out')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.clearCookie('refresh_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { message: 'Successfully logged out' };
  }
}
