import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CollaboraController } from '../controllers/collabora.controller';
import { CollaboraService } from '../../infrastructure/services/collabora.service';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { DocumentTokenService } from '../../infrastructure/services/document-token.service';
import { HttpClientService } from '../../shared/services/http-client.service';
import { AuthModule } from './auth.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { BroadcastModule } from './broadcast.module';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import { AuditoriaRepository } from '../../infrastructure/repositories/auditoria.repository';
import { AUDITORIA_REPOSITORY } from '../../domain/repositories/auditoria.repository.interface';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    DatabaseModule,
    BroadcastModule,
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
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    {
      provide: AUDITORIA_REPOSITORY,
      useClass: AuditoriaRepository,
    },
  ],
  exports: [CollaboraService],
})
export class CollaboraModule {}
