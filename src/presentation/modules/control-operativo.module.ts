import { Module } from '@nestjs/common';
import { ControlOperativoController } from '../controllers/control-operativo.controller';
import { ListarJornadasTrabajadorUseCase } from '../../application/use-cases/control-operativo/listar-jornadas-trabajador.use-case';
import { CrearJornadaUseCase } from '../../application/use-cases/control-operativo/crear-jornada.use-case';
import { ControlOperativoRepository } from '../../infrastructure/repositories/control-operativo.repository';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../domain/repositories/control-operativo.repository.interface';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        DatabaseModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'default-secret-key-change-in-production',
                signOptions: {
                    expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1d') as any,
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [ControlOperativoController],
    providers: [
        {
            provide: CONTROL_OPERATIVO_REPOSITORY,
            useClass: ControlOperativoRepository,
        },
        ListarJornadasTrabajadorUseCase,
        CrearJornadaUseCase,
        JwtStrategy,
    ],
    exports: [CONTROL_OPERATIVO_REPOSITORY],
})
export class ControlOperativoModule {}
