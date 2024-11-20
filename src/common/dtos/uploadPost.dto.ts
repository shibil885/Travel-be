import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class UploadPostDto {
  @IsNotEmpty()
  @IsString()
  caption: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsEnum(['public', 'private'])
  @IsOptional()
  visibility?: 'public' | 'private';
}
