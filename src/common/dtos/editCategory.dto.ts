import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class EditCategoryDto {
  @IsString({ message: 'Category name is must in string' })
  @IsNotEmpty({ message: 'Category name is required' })
  name: string;

  @IsString({ message: 'Description is must in string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsBoolean({ message: 'Status must in Boolean value' })
  @IsNotEmpty({ message: 'Status is required' })
  status: boolean;
}
