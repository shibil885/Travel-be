import {
  IsString,
  IsEnum,
  IsDate,
  IsNumber,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { OfferType } from 'src/common/constants/enum/offerType.enum';
import { DiscountType } from '../constants/enum/discountType.enum';

export class AddOfferDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(OfferType)
  @IsNotEmpty()
  discount_type: DiscountType;

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
