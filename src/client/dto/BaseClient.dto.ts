import { IsNotEmpty, IsString } from 'class-validator';

export class BaseClient {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  tableToken: string;
}
