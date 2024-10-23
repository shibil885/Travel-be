import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PackageService } from './package.service';
import { Response, Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('package')
export class PackageController {
  constructor(private packageService: PackageService) {}

  @Get('getAllPackages')
  async getAllPackages(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    try {
      const { totalItems, currentPage, packages } =
        await this.packageService.getAllPackages(
          req['agency'].sub,
          page,
          limit,
        );
      return res.status(HttpStatus.OK).json({
        message: 'List of packages',
        success: true,
        packages: packages,
        totalItems,
        currentPage,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: error.message,
          info: true,
          error: error.message,
          packages: [],
        });
      }
      console.error('Error while fetching packages:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
        success: false,
        error: error.message,
      });
    }
  }

  @Get('searchPackage')
  async searchPackage(
    @Req() req: Request,
    @Res() res: Response,
    @Query('searchText') searchText: string,
  ) {
    try {
      const packages = await this.packageService.searchPackges(
        req['agency'].sub,
        searchText,
      );
      if (packages) {
        res.status(HttpStatus.OK).json({
          success: true,
          packages: packages,
        });
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Patch('changeStatus/:id')
  async changeStatus(
    @Param('id') id: string,
    @Body('action') action: boolean,
    @Res() res: Response,
  ) {
    try {
      const result = await this.packageService.changeStatus(id, action);
      if (result) {
        return res
          .status(HttpStatus.OK)
          .json({ message: 'Status changed successfully', success: true });
      }
    } catch (error) {
      console.error('Error:', error.message);
      if (error instanceof NotFoundException) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: error.message, success: false });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message, success: false });
    }
  }
  @Put('saveChanges/:id')
  async saveChanges(
    @Param('id') packageId,
    @Res() res: Response,
    @Body() packageData,
  ) {
    try {
      const response = await this.packageService.saveChanges(
        packageData,
        packageId,
      );
      if (response) {
        return res.status(HttpStatus.OK).json({
          message: 'Changes saved',
          success: true,
        });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: '',
          success: false,
          error: error.message,
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: '',
        success: false,
        error: error.message,
      });
    }
  }

  @Post('add')
  @UseInterceptors(FilesInterceptor('images'))
  async addPackage(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createPackageDto: any,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    try {
      const agencyId = req['agency'].sub;
      const result = await this.packageService.addPackage(
        agencyId,
        createPackageDto,
        images,
      );
      if (result) {
        return res.status(201).json({
          message: 'Package added successfully.',
          success: true,
        });
      }
    } catch (error) {
      console.error('Error adding package:', error);
      return res.status(500).json({
        message: 'Failed to add package due to an unexpected error.',
        error: error.message,
        success: false,
      });
    }
  }
}
