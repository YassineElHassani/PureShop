import {
    IsString,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsArray,
} from 'class-validator';

export class SendNotificationDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    event: string;

    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

export class BroadcastNotificationDto {
    @IsString()
    @IsNotEmpty()
    event: string;

    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;

    @IsArray()
    @IsOptional()
    excludeUserIds?: string[];
}

export class NotificationHistoryDto {
    event: string;
    data: Record<string, any>;
    timestamp: Date;
}