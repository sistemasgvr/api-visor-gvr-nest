import { Injectable, Inject } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    ValidarActividadParams,
    ActividadCreada,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { BroadcastService } from '../../../shared/services/broadcast.service';

/** Estados de validación: 375 Aprobado, 376 Observado, 377 Rechazado */
const ESTADO_OBSERVADO = 376;
const ESTADO_RECHAZADO = 377;

export interface ValidarActividadInput {
    idActividad: number;
    idEstadoActividad: number;
    comentarioValidacion?: string | null;
    idUsuario: number;
}

@Injectable()
export class ValidarActividadUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
        private readonly broadcastService: BroadcastService,
    ) {}

    async execute(input: ValidarActividadInput): Promise<ActividadCreada | null> {
        const idCoordinadorRevisor = await this.controlOperativoRepository.obtenerIdTrabajadorPorIdUsuario(
            input.idUsuario,
        );
        if (idCoordinadorRevisor == null) {
            return null;
        }
        const params: ValidarActividadParams = {
            idActividad: input.idActividad,
            idEstadoActividad: input.idEstadoActividad,
            comentarioValidacion: input.comentarioValidacion ?? null,
            idCoordinadorRevisor,
            idUsuarioModificacion: input.idUsuario,
        };
        const data = await this.controlOperativoRepository.validarActividad(params);
        if (!data) return null;

        const notificarTrabajador =
            input.idEstadoActividad === ESTADO_OBSERVADO || input.idEstadoActividad === ESTADO_RECHAZADO;
        if (notificarTrabajador) {
            try {
                const nombreRevisor =
                    await this.controlOperativoRepository.obtenerNombreTrabajadorPorId(idCoordinadorRevisor);
                const nombreRevisorDisplay = nombreRevisor?.trim() || 'El responsable';
                const idUsuarioTrabajador =
                    await this.controlOperativoRepository.obtenerIdUsuarioPorIdTrabajador(data.idtrabajador);
                if (idUsuarioTrabajador != null) {
                    const type =
                        input.idEstadoActividad === ESTADO_RECHAZADO ? 'actividad_rechazada' : 'actividad_observada';
                    const title =
                        input.idEstadoActividad === ESTADO_RECHAZADO
                            ? 'Actividad rechazada'
                            : 'Actividad con observaciones';
                    const message =
                        input.idEstadoActividad === ESTADO_RECHAZADO
                            ? `ha rechazado tu actividad "${data.nombreactividad}".`
                            : `ha dejado observaciones en tu actividad "${data.nombreactividad}".`;
                    const notification = {
                        type,
                        title,
                        message,
                        reviewedBy: {
                            id: idCoordinadorRevisor,
                            name: nombreRevisorDisplay,
                            fotoPerfil: null as string | null,
                        },
                        idActividad: data.id,
                        idTrabajador: data.idtrabajador,
                        nombreActividad: data.nombreactividad,
                        comentarioValidacion: input.comentarioValidacion ?? null,
                        idEstadoActividad: input.idEstadoActividad,
                        timestamp: new Date().toISOString(),
                    };
                    await this.broadcastService.emitNotificationToUser(idUsuarioTrabajador, notification);
                }
            } catch (error) {
                console.error('Error al emitir notificación de observación/rechazo:', error);
            }
        }

        return data;
    }
}
