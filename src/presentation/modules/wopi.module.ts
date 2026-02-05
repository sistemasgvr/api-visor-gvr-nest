import { Module } from '@nestjs/common';
import { WopiController } from '../controllers/wopi.controller';
import { OfficeDocumentModule } from './office-document.module';
import { WopiLockService } from '../../infrastructure/services/wopi-lock.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { HttpClientService } from '../../shared/services/http-client.service';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
    imports: [DatabaseModule, OfficeDocumentModule],
    controllers: [WopiController],
    providers: [
        WopiLockService,
        AutodeskApiService,
        HttpClientService,
        {
            provide: ACC_REPOSITORY,
            useClass: AccRepository,
        },
    ],
})
export class WopiModule { }
