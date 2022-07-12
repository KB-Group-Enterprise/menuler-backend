import { IsNotEmpty } from 'class-validator';

export class JoinOrLeaveTable {
  @IsNotEmpty()
  tableToken: string;
  @IsNotEmpty()
  username: string;
}
