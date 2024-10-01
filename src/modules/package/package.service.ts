import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { CreatePackageDto } from 'src/common/dtos/createPackage.dto';
import { Request, Response } from 'express';
import { Package, Packages } from './schema/package.schema';

@Injectable()
export class PackageService {
  constructor(
    @InjectModel('Packages') private packagesModel: Model<Packages>,
    @InjectModel('Package') private packageModel: Model<Package>,
  ) {}

  async addPackage(
    req: Request,
    res: Response,
    createPackageDto: CreatePackageDto,
  ) {
    try {
      const agencyId = new ObjectId(req['agency'].sub);
      console.log('Agency ID:', agencyId);

      if (!Types.ObjectId.isValid(agencyId)) {
        return res
          .status(400)
          .json({ message: 'Invalid Agency ID format.', success: false });
      }

      let agencyPackages = await this.packagesModel.findOne({ agencyId });

      if (!agencyPackages) {
        agencyPackages = new this.packagesModel({
          agencyId,
          packages: [],
        });
      }
      if (!Array.isArray(agencyPackages.packages)) {
        agencyPackages.packages = [];
      }

      const existingPackage = agencyPackages.packages.find(
        (pkg) => pkg.name.toLowerCase() === createPackageDto.name.toLowerCase(),
      );

      if (existingPackage) {
        return res.status(400).json({
          message: 'A package with the same name already exists.',
          success: false,
        });
      }

      const newPackage = new this.packageModel(createPackageDto);
      const validationError = newPackage.validateSync();

      if (validationError) {
        return res.status(400).json({
          message: `Package validation error: ${validationError.message}`,
          success: false,
        });
      }

      agencyPackages.packages.push(newPackage);

      await agencyPackages.save();

      return res.status(201).json({
        message: 'Package added successfully.',
        package: newPackage,
        success: true,
      });
    } catch (error) {
      console.log(`Failed to add package for agency:`, error.stack);
      return res.status(500).json({
        message: 'Failed to add package due to an unexpected error.',
        error: error.message,
        success: false,
      });
    }
  }
}
