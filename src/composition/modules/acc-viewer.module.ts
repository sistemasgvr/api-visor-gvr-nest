import { Module } from '@nestjs/common';
import { AccViewerController } from '../../presentation/controllers/acc-viewer.controller';
import { applicationProvider } from '../application.providers';

// Use cases
import { GenerarTokenViewerUseCase } from '../../application/use-cases/acc/viewer/generar-token-viewer.use-case';
import { ObtenerManifiestoUseCase } from '../../application/use-cases/acc/viewer/obtener-manifiesto.use-case';
import { ObtenerMetadatosUseCase } from '../../application/use-cases/acc/viewer/obtener-metadatos.use-case';
import { ObtenerTokenPublicoUseCase } from '../../application/use-cases/acc/viewer/obtener-token-publico.use-case';

// Infrastructure
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';

@Module({
  controllers: [AccViewerController],
  providers: [
    // Use cases
    applicationProvider(GenerarTokenViewerUseCase),
    applicationProvider(ObtenerTokenPublicoUseCase),
    applicationProvider(ObtenerManifiestoUseCase),
    applicationProvider(ObtenerMetadatosUseCase),
    // Infrastructure
    AutodeskApiService,
    HttpClientService,
  ],
})
export class AccViewerModule {}
