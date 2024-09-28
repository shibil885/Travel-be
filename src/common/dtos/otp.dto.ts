import { IsEmail, IsNotEmpty } from 'class-validator';

export class OtpDto {
  @IsEmail({}, { message: 'Email is required' })
  email: string;
  @IsNotEmpty({ message: 'Otp is required' })
  otp: string;
}
