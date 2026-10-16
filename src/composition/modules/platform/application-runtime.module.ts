import { Global, Module } from '@nestjs/common';
import {
  ArchiverZipArchive,
  BcryptPasswordHasher,
  EnvironmentApplicationSettings,
  NestLoggerFactory,
} from '../../../infrastructure/runtime/application-runtime.adapters';
import { ActivityDocumentsAdapter } from '../../../infrastructure/word/activity-documents.adapter';
import { StorageModule } from './storage.module';

@Global()
@Module({
  imports: [StorageModule],
  providers: [
    ArchiverZipArchive,
    BcryptPasswordHasher,
    EnvironmentApplicationSettings,
    NestLoggerFactory,
    ActivityDocumentsAdapter,
  ],
  exports: [
    ArchiverZipArchive,
    BcryptPasswordHasher,
    EnvironmentApplicationSettings,
    NestLoggerFactory,
    ActivityDocumentsAdapter,
  ],
})
export class ApplicationRuntimeModule {}
