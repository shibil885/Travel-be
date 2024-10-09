import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class TourPlanDto {
  @IsNumber()
  @IsOptional()
  _id: string;

  @IsNumber()
  @Min(1, { message: 'Id must be at least 1.' })
  day: number;

  @IsString({ each: true })
  @IsNotEmpty({ message: 'Tour plan description must not be empty.' })
  description: string[];
}

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty({ message: 'Package name is required.' })
  @Length(3, 100, {
    message: 'Package name must be between 3 and 100 characters long.',
  })
  name: string;

  @IsMongoId({ message: 'Invalid Category ID.' })
  @IsNotEmpty({ message: 'Category ID is required.' })
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'Country is required.' })
  @Length(2, 100, {
    message: 'Country name must be between 2 and 100 characters long.',
  })
  country: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required.' })
  @Length(10, 500, {
    message: 'Description must be between 10 and 500 characters long.',
  })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Departure location is required.' })
  @Length(2, 100, {
    message: 'Departure location must be between 2 and 100 characters long.',
  })
  departure: string;

  @IsString()
  @IsNotEmpty({ message: 'Final destination is required.' })
  @Length(2, 100, {
    message: 'Final destination must be between 2 and 100 characters long.',
  })
  finalDestination: string;

  @IsString()
  @IsNotEmpty({ message: 'Price is required.' })
  @Length(1, 20, { message: 'Price must be between 1 and 20 characters long.' })
  price: string;

  @IsNumber({}, { message: 'Number of people must be a valid number.' })
  @Min(1, { message: 'Number of people must be at least 1.' })
  people: number;

  @IsArray()
  @IsString({ each: true, message: 'Included items must be strings.' })
  @IsNotEmpty({ each: true, message: 'Included items must not be empty.' })
  included: string[];

  @IsArray()
  @IsString({ each: true, message: 'Not included items must be strings.' })
  @IsNotEmpty({ each: true, message: 'Not included items must not be empty.' })
  notIncluded: string[];

  @IsNumber({}, { message: 'Number of days must be a valid number.' })
  @Min(1, { message: 'Number of days must be at least 1.' })
  @Max(365, { message: 'Number of days cannot exceed 365.' })
  days: number;

  @IsArray()
  @ValidateNested({ each: true })
  @IsNotEmpty({ message: 'Tour plans are required.' })
  tourPlans: TourPlanDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
