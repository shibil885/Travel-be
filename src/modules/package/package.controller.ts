import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { PackageService } from './package.service';
import { Response, Request } from 'express';

@Controller('package')
export class PackageController {
  constructor(private packageService: PackageService) {}

  @Get('getAllPackages')
  async getAllPackages(@Req() req: Request, @Res() res: Response) {
    try {
      console.log('get called');
      const packages = await this.packageService.getAllPackages(req, res);
      console.log('packages', packages);
      if (packages) {
        return res.status(HttpStatus.OK).json({
          message: 'List of packages',
          success: true,
          packages: packages,
        });
      }
      return res.status(HttpStatus.OK).json({
        message: 'Cant find Packages ',
        success: true,
        packages: [],
      });
    } catch (error) {
      console.log('error while fetching packages from an agency', error);
    }
  }
  @Patch('changeStatus/:id')
  async changeStatus(
    @Param('id') id: string,
    @Body('action') action: boolean,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.packageService.changeStatus(req, id, action);
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Status changed successfully', success: true });
    } catch (error) {
      console.error('Error:', error.message);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message, success: false });
    }
  }
  @Post('saveChanges')
  saveChanges(@Req() req, @Res() res: Response, @Body() packageData) {
    return this.packageService.saveChanges(req, res, packageData);
  }
  @Post('add')
  addPackage(@Req() req, @Res() res: Response, @Body() packageData) {
    return this.packageService.addPackage(req, res, packageData);
  }
}
