import { ID_ESTADO_ENTREGABLE_CULMINADO } from '../../../domain/constants/estado-entregable.constants';
import type {
  CrearEntregableProyectoData,
  IProyectoRepository,
} from '../../../domain/repositories/proyecto.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { BroadcastPort } from '../../ports/broadcast.port';
import { ApplicationLogger, LoggerFactoryPort } from '../../ports/runtime.port';
import {
  esRolCoordinador,
  esRolModeladorColaborador,
  responsablePerteneceAlProyecto,
} from './entregable-acceso.helper';
import { emitirEntregableAsignado } from './entregable-notificaciones.helper';
import { resolverIdsResponsablesEntrada } from './entregable-responsables.helper';

export class CrearEntregableProyectoUseCase {
  private readonly logger: ApplicationLogger;

  constructor(
    private readonly proyectoRepository: IProyectoRepository,
    private readonly broadcastService: BroadcastPort,
    private readonly loggerFactory: LoggerFactoryPort,
  ) {
    this.logger = this.loggerFactory.create(
      CrearEntregableProyectoUseCase.name,
    );
  }

  async execute(
    data: CrearEntregableProyectoData,
    idUsuarioCreacion: number,
    rolesIds: number[] = [],
  ) {
    if (data.idEstado === ID_ESTADO_ENTREGABLE_CULMINADO) {
      throw new InvalidInputError(
        'No se puede crear un entregable como CULMINADO. Márcalo desde una actividad.',
      );
    }

    const resuelto = resolverIdsResponsablesEntrada(data);
    let idsResponsables = resuelto.tocar ? resuelto.ids : [];

    const idTrabajadorActor =
      await this.proyectoRepository.obtenerIdTrabajadorPorIdUsuario(
        idUsuarioCreacion,
      );

    if (idsResponsables.length === 0) {
      if (esRolCoordinador(rolesIds)) {
        throw new InvalidInputError(
          'El responsable es obligatorio al crear un entregable como coordinador',
        );
      }
      if (esRolModeladorColaborador(rolesIds)) {
        if (idTrabajadorActor == null) {
          throw new InvalidInputError(
            'No se encontró trabajador activo para auto-asignarte como responsable',
          );
        }
        idsResponsables = [idTrabajadorActor];
      } else {
        throw new InvalidInputError(
          'Debe indicar al menos un trabajador responsable del entregable',
        );
      }
    }

    for (const idResponsable of idsResponsables) {
      const okResponsable = await responsablePerteneceAlProyecto(
        this.proyectoRepository,
        data.idProyecto,
        idResponsable,
      );
      if (!okResponsable) {
        throw new InvalidInputError(
          `El responsable (id ${idResponsable}) debe pertenecer al proyecto (acceso o equipo configurado)`,
        );
      }
    }

    const resultado = await this.proyectoRepository.crearEntregableProyecto(
      data.idProyecto,
      {
        ...data,
        idTrabajadoresResponsables: idsResponsables,
        idTrabajadorResponsable: idsResponsables[0] ?? null,
      },
      idUsuarioCreacion,
    );

    if (!resultado?.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al crear el entregable',
      );
    }

    if (resultado.id != null && resultado.id > 0) {
      for (const idResponsable of idsResponsables) {
        await emitirEntregableAsignado({
          logger: this.loggerFactory.create('EntregableNotificaciones'),
          broadcast: this.broadcastService,
          proyectoRepository: this.proyectoRepository,
          idEntregable: resultado.id,
          nombreEntregable: data.nombre.trim(),
          idProyecto: data.idProyecto,
          idTrabajadorResponsable: idResponsable,
          idUsuarioActor: idUsuarioCreacion,
          idTrabajadorActor,
          fechaEstimada: data.fechaEstimada ?? null,
        });
      }
    } else {
      this.logger.warn(
        '[NOTIF] CrearEntregable: sin id de entregable para notificar asignación',
      );
    }

    return resultado;
  }
}
