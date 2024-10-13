import { IsArray, IsNotEmpty } from 'class-validator';

export class CreatePackageDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  country: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  departure: string;

  @IsNotEmpty()
  finalDestination: string;

  @IsNotEmpty()
  price: string;

  @IsNotEmpty()
  people: string;

  @IsArray()
  included: string[];

  @IsArray()
  notIncluded: string[];

  @IsNotEmpty()
  days: string;

  @IsArray()
  TourPlans: {
    day: number;
    description: string;
  }[];
}
