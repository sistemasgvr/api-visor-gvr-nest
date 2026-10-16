import { Module } from '@nestjs/common';
import { EVIDENCIA_IMAGE_OPTIMIZER } from '../../../application/ports/evidencia-image-optimizer.interface';
import { SharpEvidenciaImageOptimizerService } from '../../../infrastructure/images/sharp-evidencia-image-optimizer.service';
import { MinioStorageService } from '../../../infrastructure/storage/minio-storage.service';
import { StorageController } from '../../../presentation/controllers/storage.controller';

@Module({
  controllers: [StorageController],
  providers: [
    {
      provide: EVIDENCIA_IMAGE_OPTIMIZER,
      useClass: SharpEvidenciaImageOptimizerService,
    },
    MinioStorageService,
  ],
  exports: [EVIDENCIA_IMAGE_OPTIMIZER, MinioStorageService],
})
export class StorageModule {}
