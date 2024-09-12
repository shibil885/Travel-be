import { Body, Controller, Post, Res } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { CreateAgencyDto } from 'src/common/dtos/CreateAgency.dto';
import { Response } from 'express';

@Controller('agency')
export class AgencyController {
  constructor(private agencyService: AgencyService) {}
  @Post('signup')
  signup(@Res() res: Response, @Body() agencyData: CreateAgencyDto) {
    return this.agencyService.signup(res, agencyData);
  }
}
