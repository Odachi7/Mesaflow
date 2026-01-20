import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: {
        origin: '*', // Permitir qualquer origem por enquanto (dev)
    },
    namespace: 'events',
})
export class EventsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('EventsGateway');

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    afterInit(server: Server) {
        this.logger.log('WebSocket Gateway Initialized');
    }

    async handleConnection(client: Socket, ...args: any[]) {
        try {
            // Autenticação via Token no handshake (query param 'token' ou header)
            const token =
                client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.split(' ')[1] ||
                client.handshake.query?.token;

            if (!token) {
                this.logger.warn(`Client ${client.id} disconnected: No token provided`);
                client.disconnect();
                return;
            }

            const secret = this.configService.get<string>('JWT_SECRET');
            const payload = this.jwtService.verify(token, { secret });

            // Armazenar dados do usuário no socket
            client.data.user = payload;

            // Entrar na sala do Tenant
            if (payload.tenantId) {
                await client.join(`tenant:${payload.tenantId}`);
                this.logger.log(`Client ${client.id} joined tenant room: tenant:${payload.tenantId}`);
            }

            this.logger.log(`Client connected: ${client.id} (User: ${payload.username})`);
        } catch (error) {
            this.logger.error(`Connection error for client ${client.id}: ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Método utilitário para emitir eventos para um tenant específico
    emitToTenant(tenantId: string, event: string, data: any) {
        this.server.to(`tenant:${tenantId}`).emit(event, data);
    }
}
