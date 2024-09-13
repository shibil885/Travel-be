import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { PackageService } from './package.service';
import { Response } from 'express';

@Controller('package')
export class PackageController {
  constructor(private packageService: PackageService) {}

  @Post('add/:id')
  addPackage(@Param() param, @Res() res: Response, @Body() packageData) {
    return this.packageService.addPackage(param.id, res, packageData);
  }
}
