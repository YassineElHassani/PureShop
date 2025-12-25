import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';

export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(50)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
