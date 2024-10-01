import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { PackageService } from './package.service';
import { Response } from 'express';

@Controller('package')
export class PackageController {
  constructor(private packageService: PackageService) {}

  @Post('add')
  addPackage(@Req() req, @Res() res: Response, @Body() packageData) {
    console.log('package data', packageData);
    return this.packageService.addPackage(req, res, packageData);
  }
}
