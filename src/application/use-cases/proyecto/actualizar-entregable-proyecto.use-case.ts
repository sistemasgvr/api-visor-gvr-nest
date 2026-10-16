import { ID_ESTADO_ENTREGABLE_CULMINADO } from '../../../domain/constants/estado-entregable.constants';
import type {
  ActualizarEntregableProyectoData,
  IProyectoRepository,
} from '../../../domain/repositories/proyecto.repository.interface';
import {
  ForbiddenError,
  InvalidInputError,
  NotFoundError,
} from '../../errors/application.error';
import { BroadcastPort } from '../../ports/broadcast.port';
import { LoggerFactoryPort } from '../../ports/runtime.port';
import {
  puedeGestionarEntregable,
  responsablePerteneceAlProyecto,
} from './entregable-acceso.helper';
import { emitirEntregableAsignado } from './entregable-notificaciones.helper';
import {
  idsResponsablesDesdeEntregable,
  idsResponsablesNuevos,
  resolverIdsResponsablesEntrada,
} from './entregable-responsables.helper';

export class ActualizarEntregableProyectoUseCase {
  constructor(
    private readonly proyectoRepository: IProyectoRepository,
    private readonly broadcastService: BroadcastPort,
    private readonly loggerFactory: LoggerFactoryPort,
  ) {}

  async execute(
    idEntregable: number,
    data: ActualizarEntregableProyectoData,
    idUsuarioModificacion: number,
    rolesIds: number[] = [],
  ) {
    const actual =
      await this.proyectoRepository.obtenerEntregablePorId(idEntregable);
    if (!actual) {
      throw new NotFoundError('El entregable no existe o está inactivo');
    }

    const puede = await puedeGestionarEntregable(this.proyectoRepository, {
      entregable: actual,
      idUsuario: idUsuarioModificacion,
      rolesIds,
    });
    if (!puede) {
      throw new ForbiddenError('No tienes permiso para editar este entregable');
    }

    if (data.idEstado === ID_ESTADO_ENTREGABLE_CULMINADO) {
      const yaCulminado =
        Number(actual.idestado) === ID_ESTADO_ENTREGABLE_CULMINADO;
      if (!yaCulminado) {
        throw new InvalidInputError(
          'No se puede marcar CULMINADO desde entregables. Úsalo al registrar/editar una actividad.',
        );
      }
    }

    const resuelto = resolverIdsResponsablesEntrada(data);
    const idsAnteriores = idsResponsablesDesdeEntregable(actual);
    const idTrabajadorActor =
      await this.proyectoRepository.obtenerIdTrabajadorPorIdUsuario(
        idUsuarioModificacion,
      );

    if (resuelto.tocar) {
      if (resuelto.ids.length === 0) {
        throw new InvalidInputError(
          'Debe indicar al menos un trabajador responsable del entregable',
        );
      }
      const idProyecto = Number(actual.idproyecto);
      for (const idResponsable of resuelto.ids) {
        const ok = await responsablePerteneceAlProyecto(
          this.proyectoRepository,
          idProyecto,
          idResponsable,
        );
        if (!ok) {
          throw new InvalidInputError(
            `El responsable (id ${idResponsable}) debe pertenecer al proyecto (acceso o equipo configurado)`,
          );
        }
      }
    }

    const payloadRepo: ActualizarEntregableProyectoData = {
      ...data,
      ...(resuelto.tocar
        ? {
            idTrabajadoresResponsables: resuelto.ids,
            idTrabajadorResponsable: resuelto.ids[0] ?? null,
          }
        : {
            idTrabajadoresResponsables: undefined,
            idTrabajadorResponsable: undefined,
          }),
    };

    const resultado =
      await this.proyectoRepository.actualizarEntregableProyecto(
        idEntregable,
        payloadRepo,
        idUsuarioModificacion,
      );

    if (!resultado?.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al actualizar el entregable',
      );
    }

    if (resuelto.tocar) {
      const nuevos = idsResponsablesNuevos(idsAnteriores, resuelto.ids);
      if (nuevos.length > 0) {
        const nombreEntregable =
          data.nombre?.trim() ||
          String(actual.nombre ?? '').trim() ||
          `Entregable #${idEntregable}`;
        for (const idResponsable of nuevos) {
          await emitirEntregableAsignado({
            logger: this.loggerFactory.create('EntregableNotificaciones'),
            broadcast: this.broadcastService,
            proyectoRepository: this.proyectoRepository,
            idEntregable,
            nombreEntregable,
            idProyecto: Number(actual.idproyecto),
            nombreProyecto: actual.nombreproyecto ?? null,
            idTrabajadorResponsable: idResponsable,
            idUsuarioActor: idUsuarioModificacion,
            idTrabajadorActor,
            fechaEstimada: data.fechaEstimada ?? actual.fechaestimada ?? null,
          });
        }
      }
    }

    return resultado;
  }
}
