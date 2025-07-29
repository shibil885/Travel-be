import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  userName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must contain at least one letter, one number, and one special character',
  })
  password: string;

  @IsNotEmpty({ message: 'profile picture is required' })
  profilePicture?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Phone number  is required' })
  phone: number;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'Preferences  is required' })
  preferences: string[];
}
