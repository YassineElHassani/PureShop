import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export class RegisterDto {
  @ApiProperty({ description: 'User email address', example: 'newuser@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (minimum 6 characters)', example: 'securePassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ 
    description: 'User role (defaults to CLIENT if not provided)', 
    enum: Role,
    example: 'CLIENT',
    default: 'CLIENT'
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}