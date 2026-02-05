import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CollaboraController } from '../controllers/collabora.controller';
import { CollaboraService } from '../../infrastructure/services/collabora.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { DocumentTokenService } from '../../infrastructure/services/document-token.service';
import { HttpClientService } from '../../shared/services/http-client.service';
import { AuthModule } from './auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [CollaboraController],
  providers: [
    CollaboraService,
    AutodeskApiService,
    DocumentTokenService,
    HttpClientService,
  ],
  exports: [CollaboraService],
})
export class CollaboraModule {}
