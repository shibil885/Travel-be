import {
  Body,
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AgencyService } from './agency.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('agency')
export class AgencyController {
  constructor(private agencyService: AgencyService) {}

  @Post('signup')
  @UseInterceptors(FileInterceptor('document'))
  signup(
    @Res() res: Response,
    @Body() agencyData: FormData,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.agencyService.signup(res, agencyData, file);
  }

  @Post('isExistingMail')
  findEmail(@Res() res: Response, @Body() body) {
    return this.agencyService.findEmail(res, body.email);
  }
  @Post('isExistingName')
  findName(@Res() res: Response, @Body() body) {
    return this.agencyService.findName(res, body.name);
  }
  @Post('isConfirmed')
  isConfirmed(@Res() res: Response, @Body() body) {
    return this.agencyService.isConfirmed(res, body.email);
  }
}
