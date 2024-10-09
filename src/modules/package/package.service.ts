import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { Package, Packages, TourPlans } from './schema/package.schema';

@Injectable()
export class PackageService {
  constructor(
    @InjectModel(Packages.name) private packagesModel: Model<Packages>,
    @InjectModel(Package.name) private packageModel: Model<Package>,
    @InjectModel(TourPlans.name) private tourPlanModel: Model<TourPlans>,
  ) {}

  async addPackage(req: Request, res: Response, createPackageDto) {
    try {
      console.log('called');
      console.log('call', createPackageDto);

      const agencyId = new ObjectId(req['agency'].sub);
      if (!Types.ObjectId.isValid(agencyId)) {
        return res
          .status(400)
          .json({ message: 'Invalid Agency ID format.', success: false });
      }

      const newPackage = new this.packageModel(createPackageDto);
      console.log('new package', newPackage);
      let agencyPackages = await this.packagesModel.findOne({ agencyId });

      if (!agencyPackages) {
        agencyPackages = new this.packagesModel({
          agencyId,
          packages: [newPackage],
        });
      } else {
        agencyPackages.packages.push(newPackage);
      }
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

  async saveChanges(req: Request, res: Response, changedData) {
    try {
      const agencyId = new ObjectId(req['agency'].sub);

      if (!Types.ObjectId.isValid(agencyId)) {
        return res
          .status(400)
          .json({ message: 'Invalid Agency ID format.', success: false });
      }

      const newPackage = new this.packageModel(changedData);

      const agencyPackages = await this.packagesModel.findOne({
        agencyId: agencyId,
      });

      if (agencyPackages) {
        agencyPackages.packages.push(newPackage);
        await agencyPackages.save();
      } else {
        const newAgencyPackages = new this.packagesModel({
          agencyId: agencyId,
          packages: [newPackage],
        });
        await newAgencyPackages.save();
      }

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

  async getAllPackages(req, res): Promise<Package[]> {
    try {
      const agencyId = req['agency'].sub;
      if (!Types.ObjectId.isValid(agencyId)) {
        return res
          .status(400)
          .json({ message: 'Invalid Agency ID format.', success: false });
      }

      const objectId = new ObjectId(agencyId);
      const agencyPackages = await this.packagesModel
        .find({ agencyId: objectId })
        .populate('category');

      if (!agencyPackages || agencyPackages.length === 0) {
        return res.status(404).json({
          message: 'No packages found for this agency.',
          success: false,
        });
      }

      return res.status(200).json({ packages: agencyPackages, success: true });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Internal server error', success: false });
    }
  }

  async changeStatus(req, id: string, action: boolean): Promise<void> {
    console.log(action);
    const agencyId = new ObjectId(req['agency'].sub);

    const result = await this.packagesModel.updateOne(
      { agencyId: agencyId, 'packages._id': id },
      { $set: { 'packages.$.isActive': action } },
    );
    if (result.modifiedCount === 0) {
      throw new NotFoundException(
        'Package not found or not owned by the agency',
      );
    }
  }
}
