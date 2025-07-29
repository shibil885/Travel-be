import { IsIn } from 'class-validator';

export class UpdateConfirmationDto {
  @IsIn(['confirm', 'decline'], {
    message: 'Status must be either "confirm" or "decline"',
  })
  status: 'confirm' | 'decline';
}
