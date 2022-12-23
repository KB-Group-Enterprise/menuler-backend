import { IsString } from 'class-validator';

export class Options {
  @IsString()
  description: string;
}
