import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AgencyService } from './agency.service';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('agency')
export class AgencyController {
  constructor(private _agencyService: AgencyService) {}

  @Get()
  @UseInterceptors()
  getAllAgencies() {
    return this._agencyService.getAllAgencies();
  }

  @Post('signup')
  @UseInterceptors(FileInterceptor('document'))
  signup(
    @Res() res: Response,
    @Body() agencyData: FormData,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this._agencyService.signup(res, agencyData, file);
  }

  @Patch('logout')
  async agencyLogout(@Req() req: Request, @Res() res: Response) {
    res.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.clearCookie('refresh_token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.status(HttpStatus.OK).json({
      message: 'Successfully logged out',
      success: true,
    });
  }

  @Post('isExistingMail')
  findEmail(@Res() res: Response, @Body() body) {
    return this._agencyService.findEmail(res, body.email);
  }
  @Post('isExistingName')
  findName(@Res() res: Response, @Body() body) {
    return this._agencyService.findName(res, body.name);
  }
  @Get('isConfirmed')
  isConfirmed(@Req() req: Request, @Res() res: Response) {
    return this._agencyService.isConfirmed(req, res);
  }
}
