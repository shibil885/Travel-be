import { Module } from '@nestjs/common';
import { PackageController } from './package.controller';
import { PackageService } from './package.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Package,
  Packages,
  PackageSchema,
  PackagesSchema,
} from './schema/package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Packages.name, schema: PackagesSchema },
      { name: Package.name, schema: PackageSchema },
    ]),
  ],
  controllers: [PackageController],
  providers: [PackageService],
})
export class PackageModule {}
