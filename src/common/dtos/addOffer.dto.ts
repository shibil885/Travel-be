import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class AddOfferDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  discount_type;

  @IsOptional()
  discount_value: number;

  @IsNumber()
  @IsOptional()
  percentage: number;

  @IsNotEmpty()
  expiry_date: Date;
}
