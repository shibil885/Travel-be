import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsDate,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

export class BookingDataDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsDate()
  travelDates: Date;

  @IsNotEmpty()
  @IsNumber()
  travelers: number;
}
