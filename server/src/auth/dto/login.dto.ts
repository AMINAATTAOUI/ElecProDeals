import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email invalide' })
  email!: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Mot de passe trop court (8 caractères minimum)' })
  password!: string;
}
