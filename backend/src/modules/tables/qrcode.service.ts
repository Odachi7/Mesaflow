import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

@Injectable()
export class QRCodeService {
    constructor(private readonly configService: ConfigService) { }

    async generateTableQRCode(tenantId: string, tableNumber: string): Promise<string> {
        // URL que o QR Code vai apontar - para o frontend do tenant com número da mesa
        const frontendUrl = this.configService.get('NEXT_PUBLIC_API_URL') || 'http://localhost:3000';
        const url = `${frontendUrl}/table/${tenantId}/${tableNumber}`;

        try {
            // Gerar QR Code como Data URL (base64)
            const qrCodeDataUrl = await QRCode.toDataURL(url, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                width: 300,
                margin: 2,
            });

            return qrCodeDataUrl;
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            throw new Error('Falha ao gerar QR Code');
        }
    }
}
