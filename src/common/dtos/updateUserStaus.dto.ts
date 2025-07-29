import { IsIn } from 'class-validator';

export class UpdateUserStatusDto {
  @IsIn(['block', 'unblock'], {
    message: 'Status must be either "block" or "unblock"',
  })
  status: 'block' | 'unblock';
}
