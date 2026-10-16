import { Module } from '@nestjs/common';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { DocumentTokenService } from '../../infrastructure/services/document-token.service';
import { OfficeDocumentController } from '../../presentation/controllers/office-document.controller';
import { DatabaseModule } from './platform/database.module';

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
