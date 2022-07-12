import { IsNotEmpty } from 'class-validator';

export class Client {
  @IsNotEmpty()
  clientId: string;

  @IsNotEmpty()
  username: string;
}
