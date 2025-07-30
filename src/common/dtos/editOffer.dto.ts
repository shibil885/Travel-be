import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
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

  @IsOptional()
  discount_value?: number;

  @IsNumber()
  @IsOptional()
  percentage?: number;

  @IsOptional()
  expiry_date?: Date;
}
