import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseClient } from './BaseClient.dto';

export class JoinOrLeaveTable extends BaseClient {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  userId?: string;
}
