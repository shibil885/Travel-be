import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class UploadPostDto {
  @IsNotEmpty()
  @IsString()
  caption: string;

  @IsEnum(['public', 'private'])
  @IsOptional()
  visibility?: 'public' | 'private';
}
