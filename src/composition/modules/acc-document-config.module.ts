import { Module } from '@nestjs/common';
import {
  CreateNamingStandardFromTemplateUseCase,
  EliminarFolderNamingRuleUseCase,
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
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../../domain/repositories/acc-document-config.repository.interface';
import { DatabaseFunctionService } from '../../infrastructure/database/database-function.service';
import { AccDocumentConfigRepository } from '../../infrastructure/repositories/acc-document-config.repository';
import { AccDocumentConfigController } from '../../presentation/controllers/acc-document-config.controller';
import { applicationProvider } from '../application.providers';

@Module({
  controllers: [AccDocumentConfigController],
  providers: [
    applicationProvider(ListarDocumentAttributesUseCase),
    applicationProvider(UpsertDocumentAttributeUseCase),
    applicationProvider(ListarDocumentNamingStandardsUseCase),
    applicationProvider(UpsertDocumentNamingStandardUseCase),
    applicationProvider(CreateNamingStandardFromTemplateUseCase),
    applicationProvider(ObtenerNamingTemplatePreviewUseCase),
    applicationProvider(ObtenerFolderNamingRuleUseCase),
    applicationProvider(UpsertFolderNamingRuleUseCase),
    applicationProvider(EliminarFolderNamingRuleUseCase),
    applicationProvider(GenerarNombreDocumentoUseCase),
    applicationProvider(UpsertDocumentMetadataUseCase),
    applicationProvider(ObtenerDocumentMetadataUseCase),
    applicationProvider(ListarDocumentMetadataPorCarpetaUseCase),
    {
      provide: ACC_DOCUMENT_CONFIG_REPOSITORY,
      useClass: AccDocumentConfigRepository,
    },
    DatabaseFunctionService,
  ],
})
export class AccDocumentConfigModule {}
