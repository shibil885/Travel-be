import { IsNotEmpty, IsString, IsArray, IsObject } from 'class-validator';
import { TourPlan } from 'src/modules/package/schema/package.schema';

export class CreatePackageDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  category_id: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  departure_from: string;

  @IsNotEmpty()
  @IsString()
  destination: string;

  @IsNotEmpty()
  @IsString()
  price: string;

  @IsNotEmpty()
  @IsString()
  no_of_people: string;

  @IsArray()
  included: string[];

  @IsArray()
  notIncluded: string[];

  @IsNotEmpty()
  @IsString()
  no_of_days: string;

  @IsObject()
  tour_plan: TourPlan;

  @IsArray()
  images: string[];
}
