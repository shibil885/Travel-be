// import { Module } from '@nestjs/common';
// import { PackageController } from './package.controller';
// import { PackageService } from './package.service';
// import { MongooseModule } from '@nestjs/mongoose';
// import { Package, PackageSchema } from './schema/package.schema';
// import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

// @Module({
//   imports: [
//     MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }]),
//   ],
//   controllers: [PackageController],
//   providers: [PackageService, CloudinaryService],
// })
// export class PackageModule {}

// src/modules/package/package.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PackageController } from './package.controller';
import { PackageService } from './package.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Package, PackageSchema } from './schema/package.schema';
import { PackageRepository } from './repositories/package.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }]),
  ],
  controllers: [PackageController],
  providers: [
    PackageService,
    CloudinaryService,
    {
      provide: 'IPackageRepository',
      useClass: PackageRepository,
    },
  ],
  exports: [PackageService, 'IPackageRepository'],
})
export class PackageModule {}
