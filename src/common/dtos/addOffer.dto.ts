import {
  IsString,
  IsEnum,
  IsDate,
  IsNumber,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { OfferType } from 'src/common/enum/offerType.enum';

export class AddOfferDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(OfferType)
  @IsNotEmpty()
  discount_type: OfferType;

  @IsNumber()
  @IsOptional()
  discount_value: number;

  @IsNumber()
  @IsOptional()
  percentage: number;

  @IsDate()
  @IsNotEmpty()
  expiry_date: Date;
}
