import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Package } from './schema/package.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class PackageService {
  constructor(
    @InjectModel(Package.name) private packageModel: Model<Package>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async addPackage(
    agencyId: string,
    createPackageDto: any,
    images: Express.Multer.File[],
  ): Promise<Package> {
    try {
      const parsedPackageInfo = JSON.parse(createPackageDto.packageInfo);
      const parsedTravelInfo = JSON.parse(createPackageDto.travelInfo);
      const parsedPackageFeatures = JSON.parse(
        createPackageDto.packageFeatures,
      );
      const parsedTourPlans = JSON.parse(createPackageDto.tourPlans);
      const imageUploadPromises = images.map((file) =>
        this.cloudinaryService
          .uploadFile(file)
          .then((response) => response.url),
      );
      const imageUrls = await Promise.all(imageUploadPromises);
      const newPackageData = {
        name: parsedPackageInfo.name,
        category: parsedPackageInfo.category,
        country: parsedPackageInfo.country,
        description: parsedPackageInfo.description,
        departure: parsedTravelInfo.departure,
        finalDestination: parsedTravelInfo.finalDestination,
        price: parsedTravelInfo.price,
        people: parsedTravelInfo.people,
        days: parsedTravelInfo.days,
        included: parsedPackageFeatures.included,
        notIncluded: parsedPackageFeatures.notIncluded,
        tourPlans: parsedTourPlans,
        images: imageUrls,
        agencyId: agencyId,
      };

      const newPackage = new this.packageModel(newPackageData);
      return await newPackage.save();
    } catch (error) {
      console.error('Error adding package:', error);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Could not create package: ' + error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async saveChanges(changedData, packageId) {
    try {
      const existingPackage = await this.packageModel.findOne({
        _id: packageId,
      });
      if (!existingPackage) {
        throw new NotFoundException('Package Not Found');
      }

      Object.assign(existingPackage, changedData);
      await existingPackage.save();
      return true;
    } catch (error) {
      console.log(`Failed to add package for agency:`, error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getAllPackages(): Promise<Package[]> {
    try {
      const packages = await this.packageModel.find().populate('category');
      if (!packages || packages.length == 0) {
        throw new NotFoundException();
      }
      return packages;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('No packages found for this agency');
      }
      console.error('Error fetching packages:', error);
      throw new InternalServerErrorException();
    }
  }

  async changeStatus(req, id: string, action: boolean): Promise<void> {
    const packageId = req.params.packageId;

    const result = await this.packageModel.updateOne(
      { _id: packageId, 'packages._id': id },
      { $set: { 'packages.$.isActive': action } },
    );
    if (result.modifiedCount === 0) {
      throw new NotFoundException(
        'Package not found or not owned by the agency',
      );
    }
  }
}
