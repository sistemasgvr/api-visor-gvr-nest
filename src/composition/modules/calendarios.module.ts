import { Module } from '@nestjs/common';
import { CALENDARIOS_REPOSITORY } from '../../domain/repositories/calendarios.repository.interface';
import { CalendariosRepository } from '../../infrastructure/repositories/calendarios.repository';
import { CalendariosController } from '../../presentation/controllers/calendarios.controller';
import { applicationProvider } from '../application.providers';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';
import { ListarCalendariosUseCase } from '../../application/use-cases/planificacion/calendarios/listar-calendarios.use-case';
import { ObtenerCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/obtener-calendario.use-case';
import { CrearCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/crear-calendario.use-case';
import { ActualizarCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/actualizar-calendario.use-case';
import { DuplicarCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/duplicar-calendario.use-case';
import { CrearVersionCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/crear-version-calendario.use-case';
import { GuardarSemanaCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/guardar-semana-calendario.use-case';
import { GuardarExcepcionCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/guardar-excepcion-calendario.use-case';
import { EliminarExcepcionCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/eliminar-excepcion-calendario.use-case';
import { PublicarVersionCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/publicar-version-calendario.use-case';
import { CambiarEstadoCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/cambiar-estado-calendario.use-case';
import { ObtenerDisponibilidadCalendarioUseCase } from '../../application/use-cases/planificacion/calendarios/obtener-disponibilidad-calendario.use-case';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  controllers: [CalendariosController],
  providers: [
    { provide: CALENDARIOS_REPOSITORY, useClass: CalendariosRepository },
    applicationProvider(ListarCalendariosUseCase),
    applicationProvider(ObtenerCalendarioUseCase),
    applicationProvider(CrearCalendarioUseCase),
    applicationProvider(ActualizarCalendarioUseCase),
    applicationProvider(DuplicarCalendarioUseCase),
    applicationProvider(CrearVersionCalendarioUseCase),
    applicationProvider(GuardarSemanaCalendarioUseCase),
    applicationProvider(GuardarExcepcionCalendarioUseCase),
    applicationProvider(EliminarExcepcionCalendarioUseCase),
    applicationProvider(PublicarVersionCalendarioUseCase),
    applicationProvider(CambiarEstadoCalendarioUseCase),
    applicationProvider(ObtenerDisponibilidadCalendarioUseCase),
  ],
})
export class CalendariosModule {}
