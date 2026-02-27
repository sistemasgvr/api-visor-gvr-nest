import { Injectable, Inject, Logger } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    ValidarActividadParams,
    ActividadCreada,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { BroadcastService } from '../../../shared/services/broadcast.service';

/** Estados de validación: 375 Aprobado, 376 Observado, 377 Rechazado */
const ESTADO_APROBADO = 375;
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
    private readonly logger = new Logger(ValidarActividadUseCase.name);

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

        try {
            const nombreRevisor =
                await this.controlOperativoRepository.obtenerNombreTrabajadorPorId(idCoordinadorRevisor);
            const nombreRevisorDisplay = nombreRevisor?.trim() || 'El responsable';
            const idUsuarioTrabajador =
                await this.controlOperativoRepository.obtenerIdUsuarioPorIdTrabajador(data.idtrabajador);
            this.logger.log(
                `[NOTIF] ValidarActividad: idActividad=${data.id} idEstadoActividad=${input.idEstadoActividad} idUsuarioTrabajador=${idUsuarioTrabajador ?? 'null'}`,
            );
            if (idUsuarioTrabajador != null) {
                let type: string;
                let title: string;
                let message: string;
                if (input.idEstadoActividad === ESTADO_APROBADO) {
                    type = 'actividad_aprobada';
                    title = 'Actividad aprobada';
                    message = `ha aprobado tu actividad "${data.nombreactividad}".`;
                } else if (input.idEstadoActividad === ESTADO_RECHAZADO) {
                    type = 'actividad_rechazada';
                    title = 'Actividad rechazada';
                    message = `ha rechazado tu actividad "${data.nombreactividad}".`;
                } else {
                    type = 'actividad_observada';
                    title = 'Actividad con observaciones';
                    message = `ha dejado observaciones en tu actividad "${data.nombreactividad}".`;
                }
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
                this.logger.log(`[NOTIF] ValidarActividad: notificando al trabajador userId=${idUsuarioTrabajador} type=${type}`);
                await this.broadcastService.emitNotificationToUser(idUsuarioTrabajador, notification);
            }
        } catch (error) {
            this.logger.error('Error al emitir notificación de validación:', error);
        }

        return data;
    }
}
