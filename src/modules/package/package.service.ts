import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Package } from './schema/package.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class PackageService {
  constructor(
    @InjectModel(Package.name) private PackageModel: Model<Package>,
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
        category: new Types.ObjectId(parsedPackageInfo.category),
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

      const newPackage = new this.PackageModel(newPackageData);
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
      const existingPackage = await this.PackageModel.findOne({
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

  async getAllPackages(
    id: string,
    page: number,
    limit: number,
  ): Promise<{ totalItems: number; currentPage: number; packages: Package[] }> {
    try {
      const skip = (page - 1) * limit;
      const [packages, totalPackages] = await Promise.all([
        this.PackageModel.aggregate([
          { $match: { agencyId: new Types.ObjectId(id) } },
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            },
          },
          { $unwind: '$category' },
        ])
          .skip(skip)
          .limit(limit),
        this.PackageModel.countDocuments(),
      ]);
      if (!packages || packages.length == 0) {
        throw new NotFoundException();
      }
      return {
        packages,
        totalItems: totalPackages,
        currentPage: page,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('No packages found for this agency');
      }
      console.error('Error fetching packages:', error);
      throw new InternalServerErrorException();
    }
  }
  async searchPackges(agencyId: string, searchText: string) {
    try {
      const query = {
        agencyId: agencyId,
        $or: [
          { name: { $regex: searchText, $options: 'i' } },
          { country: { $regex: searchText, $options: 'i' } },
        ],
      };
      return await this.PackageModel.find(query).exec();
    } catch (error) {
      console.log('error occured while search packages', error);
      throw new InternalServerErrorException();
    }
  }
  async changeStatus(id: string, action: boolean): Promise<boolean> {
    const result = await this.PackageModel.updateOne(
      { _id: id },
      { $set: { isActive: action } },
    );
    if (result.modifiedCount === 0) {
      throw new NotFoundException(
        'Package not found or not owned by the agency',
      );
    }
    return true;
  }
}
