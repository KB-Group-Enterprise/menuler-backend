import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
export class CredentialInput {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
