import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Category name must in string' })
  @IsNotEmpty({ message: 'Category name is required' })
  name: string;

  @IsString({ message: 'Description must in string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;
}
