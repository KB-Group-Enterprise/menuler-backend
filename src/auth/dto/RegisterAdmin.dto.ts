import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
export class RegisterAdminInput {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
