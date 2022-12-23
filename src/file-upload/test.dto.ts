import { IsNotEmpty } from 'class-validator';

export class TestDto {
  @IsNotEmpty()
  name: string;
}
