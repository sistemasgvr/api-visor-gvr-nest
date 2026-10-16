import { Module } from '@nestjs/common';
import {
  CrearBucketUseCase,
  EliminarBucketUseCase,
  ObtenerBucketsUseCase,
  ObtenerDetallesBucketUseCase,
} from '../../application/use-cases/data-management/buckets';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { DataManagementBucketsController } from '../../presentation/controllers/data-management-buckets.controller';
import { DatabaseModule } from './platform/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DataManagementBucketsController],
  providers: [
    ObtenerBucketsUseCase,
    ObtenerDetallesBucketUseCase,
    CrearBucketUseCase,
    EliminarBucketUseCase,
    AutodeskApiService,
    HttpClientService,
    {
      provide: ACC_REPOSITORY,
      useClass: AccRepository,
    },
  ],
})
export class DataManagementBucketsModule {}
