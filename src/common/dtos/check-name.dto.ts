import { IsNotEmpty, IsString } from 'class-validator';

export class CheckNameDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
