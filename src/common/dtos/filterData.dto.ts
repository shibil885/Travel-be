import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean } from 'class-validator';

export class FilterDataDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isConfirmed?: boolean;
}
