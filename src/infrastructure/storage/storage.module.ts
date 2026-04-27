import { Module } from '@nestjs/common';
import { MinioStorageService } from './minio-storage.service';
import { StorageController } from '../../presentation/controllers/storage.controller';

@Module({
  controllers: [StorageController],
  providers: [MinioStorageService],
  exports: [MinioStorageService],
})
export class StorageModule {}
