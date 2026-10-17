import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DOCUMENT_HIERARCHY } from '../../../application/ports/document-access.port';
import { DocumentAccessService } from '../../../application/services/document-access.service';
import { ACC_REPOSITORY } from '../../../domain/repositories/acc.repository.interface';
import { DocumentHierarchyAdapter } from '../../../infrastructure/autodesk/document-hierarchy.adapter';
import { HttpClientService } from '../../../infrastructure/http/http-client.service';
import { AccRepository } from '../../../infrastructure/repositories/acc.repository';
import { AutodeskApiService } from '../../../infrastructure/services/autodesk-api.service';
import { DocumentAccessController } from '../../../presentation/controllers/document-access.controller';
import { applicationProvider } from '../../application.providers';
import { DatabaseModule } from './database.module';
import { AuthenticationModule } from './authentication.module';
import { DocumentAccessGuard } from '../../../infrastructure/auth/document-access.guard';
import { JwtAuthGuard } from '../../../infrastructure/auth/jwt-auth.guard';

/** Autorización de documentos BIM por nivel de proyecto/carpeta. */
@Global()
@Module({
  imports: [DatabaseModule, AuthenticationModule],
  controllers: [DocumentAccessController],
  providers: [
    AutodeskApiService,
    HttpClientService,
    { provide: ACC_REPOSITORY, useClass: AccRepository },
    { provide: DOCUMENT_HIERARCHY, useClass: DocumentHierarchyAdapter },
    applicationProvider(DocumentAccessService),
    JwtAuthGuard,
    { provide: APP_GUARD, useClass: DocumentAccessGuard },
  ],
  exports: [DocumentAccessService],
})
export class DocumentAccessModule {}
