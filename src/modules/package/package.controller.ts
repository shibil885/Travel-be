// import {
//   Body,
//   Controller,
//   Get,
//   HttpStatus,
//   NotFoundException,
//   Param,
//   Patch,
//   Post,
//   Put,
//   Query,
//   Req,
//   Res,
//   UploadedFiles,
//   UseInterceptors,
// } from '@nestjs/common';
// import { PackageService } from './package.service';
// import { Response, Request } from 'express';
// import { FilesInterceptor } from '@nestjs/platform-express';

// @Controller('package')
// export class PackageController {
//   constructor(private _packageService: PackageService) {}

//   @Get('getAllPackages')
//   async getAllPackages(
//     @Req() req: Request,
//     @Res() res: Response,
//     @Query('page') page: number,
//     @Query('limit') limit: number,
//   ) {
//     try {
//       const { totalItems, currentPage, packages } =
//         await this._packageService.getAllPackages(
//           req['agency'].sub,
//           page,
//           Number(limit),
//         );
//       return res.status(HttpStatus.OK).json({
//         message: 'List of packages',
//         success: true,
//         packages: packages,
//         totalItems,
//         currentPage,
//       });
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         return res.status(HttpStatus.NOT_FOUND).json({
//           message: error.message,
//           info: true,
//           error: error.message,
//           packages: [],
//         });
//       }
//       console.error('Error while fetching packages:', error);
//       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
//         message: 'Internal server error',
//         success: false,
//         error: error.message,
//       });
//     }
//   }

//   @Get('offer')
//   async getOfferPackages(@Res() res: Response) {
//     try {
//       const offerPackages = await this._packageService.getOfferPackages();
//       if (offerPackages.length) {
//         return res.status(HttpStatus.OK).json({
//           success: true,
//           message: 'List of offer packages',
//           packages: offerPackages,
//         });
//       }
//       return res.status(HttpStatus.OK).json({
//         success: true,
//         message: 'List of offer packages',
//         packages: [],
//       });
//     } catch (error) {
//       console.log('Error occured while fetching offer packages', error);
//       return res
//         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//         .json({ success: false, message: error.message });
//     }
//   }

//   @Get('searchPackage')
//   async searchPackage(
//     @Req() req: Request,
//     @Res() res: Response,
//     @Query('searchText') searchText: string,
//   ) {
//     try {
//       const packages = await this._packageService.searchPackges(
//         req['agency'].sub,
//         searchText,
//       );
//       if (packages) {
//         res.status(HttpStatus.OK).json({
//           success: true,
//           packages: packages,
//         });
//       }
//     } catch (error) {
//       res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   }

//   @Patch('changeStatus/:id')
//   async changeStatus(
//     @Param('id') id: string,
//     @Body('action') action: boolean,
//     @Res() res: Response,
//   ) {
//     try {
//       const result = await this._packageService.changeStatus(id, action);
//       if (result) {
//         return res
//           .status(HttpStatus.OK)
//           .json({ message: 'Status changed successfully', success: true });
//       }
//     } catch (error) {
//       console.error('Error:', error.message);
//       if (error instanceof NotFoundException) {
//         return res
//           .status(HttpStatus.NOT_FOUND)
//           .json({ message: error.message, success: false });
//       }
//       return res
//         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//         .json({ message: error.message, success: false });
//     }
//   }

//   @Put('saveChanges/:id')
//   async saveChanges(
//     @Param('id') packageId,
//     @Res() res: Response,
//     @Body() packageData,
//   ) {
//     try {
//       const response = await this._packageService.saveChanges(
//         packageData,
//         packageId,
//       );
//       if (response) {
//         return res.status(HttpStatus.OK).json({
//           message: 'Changes saved',
//           success: true,
//         });
//       }
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         return res.status(HttpStatus.NOT_FOUND).json({
//           message: '',
//           success: false,
//           error: error.message,
//         });
//       }
//       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
//         message: '',
//         success: false,
//         error: error.message,
//       });
//     }
//   }

//   @Post('add')
//   @UseInterceptors(FilesInterceptor('images'))
//   async addPackage(
//     @Req() req: Request,
//     @Res() res: Response,
//     @Body() createPackageDto,
//     @UploadedFiles() images: Express.Multer.File[],
//   ) {
//     try {
//       const agencyId = req['agency'].sub;
//       const result = await this._packageService.addPackage(
//         agencyId,
//         createPackageDto,
//         images,
//       );
//       if (result) {
//         return res.status(201).json({
//           message: 'Package added successfully.',
//           success: true,
//         });
//       }
//     } catch (error) {
//       console.error('Error adding package:', error);
//       return res.status(500).json({
//         message: 'Failed to add package due to an unexpected error.',
//         error: error.message,
//         success: false,
//       });
//     }
//   }

//   @Get('topBooked')
//   async getTopBookedPackges(@Res() res: Response) {
//     try {
//       const result = await this._packageService.fetchTopBookedPackages();
//       return res.status(HttpStatus.OK).json({
//         success: true,
//         message: 'List of top booked packages',
//         packages: result,
//       });
//     } catch (error) {
//       return res
//         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//         .json({ success: false, message: error.message, packages: [] });
//     }
//   }
// }

// src/modules/package/package.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PackageService } from './package.service';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiResponse } from 'src/common/decorators/response.decorator';
import { PackageSuccessMessages } from 'src/common/constants/messages';

@Controller('package')
export class PackageController {
  constructor(private readonly _packageService: PackageService) {}

  @Get()
  @ApiResponse(PackageSuccessMessages.PACKAGE_LIST_FETCHED)
  async getAllPackages(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const agencyId = req['agency'].sub;
    const result = await this._packageService.getAllPackages(
      agencyId,
      page,
      Number(limit),
    );

    return {
      packages: result.packages,
      totalItems: result.totalItems,
      currentPage: result.currentPage,
    };
  }

  @Get('offers')
  @ApiResponse(PackageSuccessMessages.PACKAGE_LIST_FETCHED)
  async getOfferPackages() {
    const result = await this._packageService.getOfferPackages();
    return { packages: result.packages };
  }

  @Get('search')
  @ApiResponse(PackageSuccessMessages.PACKAGE_LIST_FETCHED)
  async searchPackage(
    @Req() req: Request,
    @Query('searchText') searchText: string,
  ) {
    const agencyId = req['agency'].sub;
    const result = await this._packageService.searchPackages(
      agencyId,
      searchText,
    );
    return { packages: result.packages };
  }

  @Get('top-booked')
  @ApiResponse(PackageSuccessMessages.PACKAGE_LIST_FETCHED)
  async getTopBookedPackages() {
    const result = await this._packageService.getTopBookedPackages();
    return { packages: result.packages };
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiResponse(PackageSuccessMessages.PACKAGE_CREATED, HttpStatus.CREATED)
  async addPackage(
    @Req() req: Request,
    @Body() createPackageDto: any,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    const agencyId = req['agency'].sub;
    const result = await this._packageService.addPackage(
      agencyId,
      createPackageDto,
      images,
    );

    return { package: result.package };
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id') packageId: string,
    @Body('isActive') isActive: boolean,
  ) {
    const result = await this._packageService.changePackageStatus(
      packageId,
      isActive,
    );

    return {
      isActive: result.isActive,
      message: result.message,
    };
  }

  @Put(':id')
  @ApiResponse(PackageSuccessMessages.PACKAGE_UPDATED)
  async saveChanges(@Param('id') packageId: string, @Body() updateData) {
    await this._packageService.savePackageChanges(packageId, updateData);
    return {};
  }
}
