// import {
//   IsString,
//   IsNumber,
//   IsArray,
//   IsNotEmpty,
//   ValidateNested,
// } from 'class-validator';
// import { Type } from 'class-transformer';

// class PackageInfoDto {
//   @IsNotEmpty()
//   @IsString()
//   name: string;

//   @IsNotEmpty()
//   @IsString()
//   category: string;

//   @IsNotEmpty()
//   @IsString()
//   country: string;

//   @IsNotEmpty()
//   @IsString()
//   description: string;
// }

// class TravelInfoDto {
//   @IsNotEmpty()
//   @IsString()
//   departure: string;

//   @IsNotEmpty()
//   @IsString()
//   finalDestination: string;

//   @IsNotEmpty()
//   @IsNumber()
//   price: number;

//   @IsNotEmpty()
//   @IsNumber()
//   people: number;

//   @IsNotEmpty()
//   @IsNumber()
//   days: number;
// }

// class PackageFeaturesDto {
//   @IsArray()
//   @IsString({ each: true })
//   included: string[];

//   @IsArray()
//   @IsString({ each: true })
//   notIncluded: string[];
// }

// class TourPlanDto {
//   @IsNotEmpty()
//   @IsString()
//   day: string;

//   @IsNotEmpty()
//   @IsString()
//   description: string;
// }

// export class CreatePackageDto {
//   @IsNotEmpty()
//   @ValidateNested()
//   @Type(() => PackageInfoDto)
//   packageInfo: PackageInfoDto;

//   @IsNotEmpty()
//   @ValidateNested()
//   @Type(() => TravelInfoDto)
//   travelInfo: TravelInfoDto;

//   @IsNotEmpty()
//   @ValidateNested()
//   @Type(() => PackageFeaturesDto)
//   packageFeatures: PackageFeaturesDto;

//   @IsNotEmpty()
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => TourPlanDto)
//   tourPlans: TourPlanDto[];
// }
