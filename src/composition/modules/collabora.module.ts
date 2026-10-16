import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ACC_REPOSITORY } from '../../domain/repositories/acc.repository.interface';
import { AUDITORIA_REPOSITORY } from '../../domain/repositories/auditoria.repository.interface';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import { HttpClientService } from '../../infrastructure/http/http-client.service';
import { AccRepository } from '../../infrastructure/repositories/acc.repository';
import { AuditoriaRepository } from '../../infrastructure/repositories/auditoria.repository';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { AutodeskApiService } from '../../infrastructure/services/autodesk-api.service';
import { CollaboraService } from '../../infrastructure/services/collabora.service';
import { DocumentTokenService } from '../../infrastructure/services/document-token.service';
import { CollaboraController } from '../../presentation/controllers/collabora.controller';
import { AccModule } from './acc.module';
import { AuthModule } from './auth.module';
import { BroadcastModule } from './broadcast.module';
import { DatabaseModule } from './platform/database.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    DatabaseModule,
    BroadcastModule,
    AccModule,
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
