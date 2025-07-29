import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['block', 'unblock'], {
    message: 'Status must be either "block" or "unblock"',
  })
  status: 'block' | 'unblock';
}
