import {
    IsString,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsArray,
} from 'class-validator';

export class SendEmailDto {
    @IsEmail()
    @IsNotEmpty()
    to: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    template: string;

    @IsNotEmpty()
    context: Record<string, any>;

    @IsArray()
    @IsOptional()
    cc?: string[];

    @IsArray()
    @IsOptional()
    bcc?: string[];
}