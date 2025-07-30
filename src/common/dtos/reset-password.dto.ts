import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  agencyId: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
