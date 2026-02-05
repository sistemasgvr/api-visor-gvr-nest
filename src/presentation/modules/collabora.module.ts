import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CollaboraController } from '../controllers/collabora.controller';
import { CollaboraService } from '../../infrastructure/services/collabora.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { DocumentTokenService } from '../../infrastructure/services/document-token.service';
import { HttpClientService } from '../../shared/services/http-client.service';
import { AuthModule } from './auth.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';

@Module({
  imports: [
    ConfigModule, 
    AuthModule,
    DatabaseModule,
  ],
  controllers: [CollaboraController],
  providers: [
    CollaboraService,
    AutodeskApiService,
    DocumentTokenService,
    HttpClientService,
    {
      provide: ACC_REPOSITORY,
      useClass: AccRepository,
    },
  ],
  exports: [CollaboraService],
})
export class CollaboraModule {}
