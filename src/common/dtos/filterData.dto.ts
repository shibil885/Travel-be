import { IsOptional, IsBoolean } from 'class-validator';

export class FilterDataDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isConfirmed?: boolean;
}
