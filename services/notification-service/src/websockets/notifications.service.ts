import { Injectable, Logger } from '@nestjs/common';

interface Notification {
    event: string;
    data: Record<string, any>;
    timestamp: Date;
}

interface Connection {
    socketId: string;
    userId: string;
    isAdmin: boolean;
    connectedAt: Date;
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    private notificationHistory = new Map<string, Notification[]>();
    private adminNotificationHistory: Notification[] = [];
    private connections = new Map<string, Connection>();
    private readonly maxHistorySize = parseInt(
        process.env.MAX_NOTIFICATION_HISTORY || '100',
        10,
    );

    recordConnection(userId: string, socketId: string, isAdmin: boolean): void {
        this.connections.set(socketId, {
            socketId,
            userId,
            isAdmin,
            connectedAt: new Date(),
        });

        this.logger.log(
            `Connection recorded: ${socketId} for user ${userId} (admin: ${isAdmin})`,
        );
    }

    recordDisconnection(socketId: string): void {
        this.connections.delete(socketId);
        this.logger.log(`Disconnection recorded: ${socketId}`);
    }

    storeNotification(
        userId: string,
        event: string,
        data: Record<string, any>,
    ): void {
        try {
            if (!this.notificationHistory.has(userId)) {
                this.notificationHistory.set(userId, []);
            }

            const notifications = this.notificationHistory.get(userId)!;
            notifications.push({
                event,
                data,
                timestamp: new Date(),
            });

            // Keep only the last N notifications
            if (notifications.length > this.maxHistorySize) {
                notifications.shift();
            }

            this.logger.debug(
                `Notification stored for user ${userId}: ${event}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to store notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    storeAdminNotification(
        event: string,
        data: Record<string, any>,
    ): void {
        try {
            this.adminNotificationHistory.push({
                event,
                data,
                timestamp: new Date(),
            });

            // Keep only the last N notifications
            if (this.adminNotificationHistory.length > this.maxHistorySize) {
                this.adminNotificationHistory.shift();
            }

            this.logger.debug(`Admin notification stored: ${event}`);
        } catch (error) {
            this.logger.error(
                `Failed to store admin notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    getUserNotifications(userId: string): Notification[] {
        return this.notificationHistory.get(userId) || [];
    }

    getAdminNotifications(): Notification[] {
        return this.adminNotificationHistory;
    }

    clearUserNotifications(userId: string): void {
        this.notificationHistory.delete(userId);
        this.logger.log(`Notifications cleared for user ${userId}`);
    }

    clearAdminNotifications(): void {
        this.adminNotificationHistory = [];
        this.logger.log('Admin notifications cleared');
    }

    getConnectionStats(): Record<string, any> {
        const totalConnections = this.connections.size;
        const adminConnections = Array.from(this.connections.values()).filter(
            (c) => c.isAdmin,
        ).length;
        const userConnections = totalConnections - adminConnections;

        return {
            totalConnections,
            adminConnections,
            userConnections,
            activeUsers: this.notificationHistory.size,
        };
    }
}