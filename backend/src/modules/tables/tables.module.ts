import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { QRCodeService } from './qrcode.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [TablesController],
    providers: [TablesService, QRCodeService],
    exports: [TablesService],
})
export class TablesModule { }
