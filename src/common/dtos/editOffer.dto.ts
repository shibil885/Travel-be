import {
  IsString,
  IsEnum,
  IsDate,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { OfferType } from 'src/common/constants/enum/offerType.enum';

export class EditOfferDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(OfferType)
  @IsOptional()
  discount_type?: OfferType;

  @IsNumber()
  @IsOptional()
  discount_value?: number;

  @IsNumber()
  @IsOptional()
  percentage?: number;

  @IsDate()
  @IsOptional()
  expiry_date?: Date;
}
