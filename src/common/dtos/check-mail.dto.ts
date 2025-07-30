import { IsNotEmpty, IsString } from 'class-validator';

export class CheckEmailDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}
