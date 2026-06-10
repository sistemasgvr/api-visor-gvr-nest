import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailPlantillaController } from '../controllers/mail-plantilla.controller';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';
import { ListarMailPlantillasUseCase } from '../../application/use-cases/mail-plantilla/listar-mail-plantillas.use-case';
import { ObtenerMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/obtener-mail-plantilla.use-case';
import { CrearMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/crear-mail-plantilla.use-case';
import { ActualizarMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/actualizar-mail-plantilla.use-case';
import { ActualizarVariablesPruebaMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/actualizar-variables-prueba-mail-plantilla.use-case';
import { EliminarMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/eliminar-mail-plantilla.use-case';
import { ListarHistorialMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/listar-historial-mail-plantilla.use-case';
import { ObtenerHistorialMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/obtener-historial-mail-plantilla.use-case';
import { EliminarHistorialMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/eliminar-historial-mail-plantilla.use-case';
import { PreviewMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/preview-mail-plantilla.use-case';
import { TestSendMailPlantillaUseCase } from '../../application/use-cases/mail-plantilla/test-send-mail-plantilla.use-case';
import { SembrarMailPlantillasSistemaUseCase } from '../../application/use-cases/mail-plantilla/sembrar-mail-plantillas-sistema.use-case';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'default-secret-key-change-in-production',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ||
            '1d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MailPlantillaController],
  providers: [
    ListarMailPlantillasUseCase,
    ObtenerMailPlantillaUseCase,
    CrearMailPlantillaUseCase,
    ActualizarMailPlantillaUseCase,
    ActualizarVariablesPruebaMailPlantillaUseCase,
    EliminarMailPlantillaUseCase,
    ListarHistorialMailPlantillaUseCase,
    ObtenerHistorialMailPlantillaUseCase,
    EliminarHistorialMailPlantillaUseCase,
    PreviewMailPlantillaUseCase,
    TestSendMailPlantillaUseCase,
    SembrarMailPlantillasSistemaUseCase,
    JwtStrategy,
  ],
})
export class MailPlantillaModule {}
