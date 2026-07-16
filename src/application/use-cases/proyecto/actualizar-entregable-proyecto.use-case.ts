import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type {
  IProyectoRepository,
  ActualizarEntregableProyectoData,
} from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';
import { ID_ESTADO_ENTREGABLE_CULMINADO } from '../../../domain/constants/estado-entregable.constants';
import { BroadcastService } from '../../../shared/services/broadcast.service';
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

@Injectable()
export class ActualizarEntregableProyectoUseCase {
  constructor(
    @Inject(PROYECTO_REPOSITORY)
    private readonly proyectoRepository: IProyectoRepository,
    private readonly broadcastService: BroadcastService,
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
      throw new NotFoundException('El entregable no existe o está inactivo');
    }

    const puede = await puedeGestionarEntregable(this.proyectoRepository, {
      entregable: actual,
      idUsuario: idUsuarioModificacion,
      rolesIds,
    });
    if (!puede) {
      throw new ForbiddenException(
        'No tienes permiso para editar este entregable',
      );
    }

    if (data.idEstado === ID_ESTADO_ENTREGABLE_CULMINADO) {
      const yaCulminado =
        Number(actual.idestado) === ID_ESTADO_ENTREGABLE_CULMINADO;
      if (!yaCulminado) {
        throw new BadRequestException(
          'No se puede marcar CULMINADO desde entregables. Úsalo al registrar/editar una actividad.',
        );
      }
    }

    const resuelto = resolverIdsResponsablesEntrada(data);
    const idsAnteriores = idsResponsablesDesdeEntregable(actual);

    if (resuelto.tocar) {
      if (resuelto.ids.length === 0) {
        throw new BadRequestException(
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
          throw new BadRequestException(
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

    const resultado = await this.proyectoRepository.actualizarEntregableProyecto(
      idEntregable,
      payloadRepo,
      idUsuarioModificacion,
    );

    if (!resultado?.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al actualizar el entregable',
      );
    }

    if (resuelto.tocar) {
      const nuevos = idsResponsablesNuevos(idsAnteriores, resuelto.ids);
      if (nuevos.length > 0) {
        const idTrabajadorActor =
          await this.proyectoRepository.obtenerIdTrabajadorPorIdUsuario(
            idUsuarioModificacion,
          );
        const nombreEntregable =
          data.nombre?.trim() ||
          String(actual.nombre ?? '').trim() ||
          `Entregable #${idEntregable}`;
        for (const idResponsable of nuevos) {
          await emitirEntregableAsignado({
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
