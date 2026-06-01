import { Module } from '@nestjs/common';
import { AccDocumentConfigController } from '../controllers/acc-document-config.controller';
import {
  CreateNamingStandardFromTemplateUseCase,
  GenerarNombreDocumentoUseCase,
  ListarDocumentAttributesUseCase,
  ListarDocumentMetadataPorCarpetaUseCase,
  ListarDocumentNamingStandardsUseCase,
  ObtenerDocumentMetadataUseCase,
  ObtenerFolderNamingRuleUseCase,
  ObtenerNamingTemplatePreviewUseCase,
  UpsertDocumentAttributeUseCase,
  UpsertDocumentMetadataUseCase,
  UpsertDocumentNamingStandardUseCase,
  UpsertFolderNamingRuleUseCase,
} from '../../application/use-cases/acc/document-config';
import { AccDocumentConfigRepository } from '../../infrastructure/repositories/acc-document-config.repository';
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../../domain/repositories/acc-document-config.repository.interface';
import { DatabaseFunctionService } from '../../infrastructure/database/database-function.service';

@Module({
  controllers: [AccDocumentConfigController],
  providers: [
    ListarDocumentAttributesUseCase,
    UpsertDocumentAttributeUseCase,
    ListarDocumentNamingStandardsUseCase,
    UpsertDocumentNamingStandardUseCase,
    CreateNamingStandardFromTemplateUseCase,
    ObtenerNamingTemplatePreviewUseCase,
    ObtenerFolderNamingRuleUseCase,
    UpsertFolderNamingRuleUseCase,
    GenerarNombreDocumentoUseCase,
    UpsertDocumentMetadataUseCase,
    ObtenerDocumentMetadataUseCase,
    ListarDocumentMetadataPorCarpetaUseCase,
    {
      provide: ACC_DOCUMENT_CONFIG_REPOSITORY,
      useClass: AccDocumentConfigRepository,
    },
    DatabaseFunctionService,
  ],
})
export class AccDocumentConfigModule {}
