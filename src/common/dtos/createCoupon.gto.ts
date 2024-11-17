import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { DiscountType } from './editCoupon.dto';

export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsNumber()
  percentage: number;

  @IsNotEmpty()
  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  minAmt: number;

  @IsOptional()
  @IsNumber()
  maxAmt: number;

  @IsNotEmpty()
  @IsDate()
  expiry_date: Date;

  @IsOptional()
  @IsNumber()
  discount_value: number;
}
