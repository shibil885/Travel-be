import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(4, {
    message: 'Current password must be at least 4 characters long.',
  })
  @MaxLength(20, { message: 'Current password must not exceed 20 characters.' })
  currentpassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long.' })
  @MaxLength(20, { message: 'New password must not exceed 20 characters.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, {
    message: 'New password must include at least one letter and one number.',
  })
  newpassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'Confirm password must be at least 8 characters long.',
  })
  @MaxLength(20, { message: 'Confirm password must not exceed 20 characters.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, {
    message:
      'Confirm password must include at least one letter and one number.',
  })
  confirmpassword: string;
}
