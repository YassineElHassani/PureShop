import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    isAdmin?: boolean;
}

@WebSocketGateway({
    namespace: process.env.WEBSOCKET_NAMESPACE || 'notifications',
    cors: {
        origin: (process.env.WEBSOCKET_CORS_ORIGIN || '*').split(','),
        credentials: true,
    },
    transports: ['websocket', 'polling'],
})
@Injectable()
export class NotificationsGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(NotificationsGateway.name);
    private userSockets = new Map<string, Set<string>>();
    private adminSockets = new Set<string>();

    constructor(private notificationsService: NotificationsService) { }

    handleConnection(client: AuthenticatedSocket): void {
        try {
            const userId = client.handshake.auth?.userId;
            const isAdmin = client.handshake.auth?.isAdmin === true;

            if (!userId) {
                this.logger.warn('Client connected without userId');
                client.disconnect();
                return;
            }

            client.userId = userId;
            client.isAdmin = isAdmin;

            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId)?.add(client.id);

            if (isAdmin) {
                this.adminSockets.add(client.id);
                this.logger.log(`Admin connected: ${client.id}`);
            } else {
                this.logger.log(`User ${userId} connected: ${client.id}`);
            }

            // Store connection info
            this.notificationsService.recordConnection(userId, client.id, isAdmin);
        } catch (error) {
            this.logger.error(
                `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket): void {
        try {
            const userId = client.userId;
            const isAdmin = client.isAdmin;

            if (userId) {
                this.userSockets.get(userId)?.delete(client.id);

                if (this.userSockets.get(userId)?.size === 0) {
                    this.userSockets.delete(userId);
                }
            }

            if (isAdmin) {
                this.adminSockets.delete(client.id);
                this.logger.log(`Admin disconnected: ${client.id}`);
            } else {
                this.logger.log(`User ${userId} disconnected: ${client.id}`);
            }

            this.notificationsService.recordDisconnection(client.id);
        } catch (error) {
            this.logger.error(
                `Disconnection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    @SubscribeMessage('user_status')
    handleUserStatus(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { status: string },
    ): void {
        if (!client.userId) {
            throw new BadRequestException('User not authenticated');
        }

        this.logger.log(`User ${client.userId} status update: ${data.status}`);
    }

    notifyUser(
        userId: string,
        event: string,
        data: Record<string, any>,
    ): void {
        const socketIds = this.userSockets.get(userId);

        if (socketIds && socketIds.size > 0) {
            socketIds.forEach((socketId) => {
                this.server.to(socketId).emit(event, {
                    event,
                    data,
                    timestamp: new Date().toISOString(),
                });
            });

            this.logger.log(
                `Notification sent to user ${userId}: ${event}`,
            );
            this.notificationsService.storeNotification(userId, event, data);
        }
    }

    notifyAdmins(event: string, data: Record<string, any>): void {
        if (this.adminSockets.size > 0) {
            this.adminSockets.forEach((socketId) => {
                this.server.to(socketId).emit(`admin:${event}`, {
                    event,
                    data,
                    timestamp: new Date().toISOString(),
                });
            });

            this.logger.log(`Admin notification sent: ${event}`);
            this.notificationsService.storeAdminNotification(event, data);
        }
    }

    broadcastToAll(event: string, data: Record<string, any>): void {
        this.server.emit(event, {
            event,
            data,
            timestamp: new Date().toISOString(),
        });

        this.logger.log(`Broadcast sent to all users: ${event}`);
    }

    getConnectedUsers(): string[] {
        return Array.from(this.userSockets.keys());
    }

    getConnectedAdmins(): number {
        return this.adminSockets.size;
    }
}