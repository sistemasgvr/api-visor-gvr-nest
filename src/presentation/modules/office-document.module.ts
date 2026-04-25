import { Module } from '@nestjs/common';
import { OfficeDocumentController } from '../controllers/office-document.controller';
import { DocumentTokenService } from '../../infrastructure/services/document-token.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { HttpClientService } from '../../shared/services/http-client.service';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [OfficeDocumentController],
  providers: [
    DocumentTokenService,
    AutodeskApiService,
    HttpClientService,
    {
      provide: ACC_REPOSITORY,
      useClass: AccRepository,
    },
  ],
  exports: [DocumentTokenService],
})
export class OfficeDocumentModule {}
