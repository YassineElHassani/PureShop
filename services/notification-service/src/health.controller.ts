import { Controller, Get } from '@nestjs/common';
import { NotificationsGateway } from './websockets/notifications.gateway';

@Controller('health')
export class HealthController {
    constructor(private notificationsGateway: NotificationsGateway) { }

    @Get()
    health() {
        const stats = this.notificationsGateway.getConnectedUsers();
        const adminCount = this.notificationsGateway.getConnectedAdmins();

        return {
            status: 'UP',
            service: 'Notification Service',
            timestamp: new Date().toISOString(),
            websocket: {
                connectedUsers: stats.length,
                connectedAdmins: adminCount,
            },
        };
    }
}