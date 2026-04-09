import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { TRABAJADOR_REPOSITORY } from '../../../domain/repositories/trabajador.repository.interface';
import { MailService } from '../../services/mail.service';

export interface EnviarCorreoBienvenidaDemoResult {
    idTrabajador: number;
    correo: string;
    nombre: string;
    jobId?: string;
}

/**
 * Solo para pruebas (ruta demo): busca trabajador por id y encola/envía plantilla welcome.
 */
@Injectable()
export class EnviarCorreoBienvenidaDemoUseCase {
    constructor(
        @Inject(TRABAJADOR_REPOSITORY)
        private readonly trabajadorRepository: ITrabajadorRepository,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
    ) { }

    async execute(idTrabajador: number): Promise<EnviarCorreoBienvenidaDemoResult> {
        if (idTrabajador == null || idTrabajador < 1) {
            throw new BadRequestException('idTrabajador inválido');
        }

        const row = await this.trabajadorRepository.obtenerTrabajadorPorId(idTrabajador);
        if (!row) {
            throw new NotFoundException('Trabajador no encontrado');
        }

        const estado = row.estado ?? row.Estado;
        if (estado !== 1) {
            throw new BadRequestException('Trabajador inactivo');
        }

        const correo = String(row.correo ?? row.Correo ?? '').trim();
        if (!correo) {
            throw new BadRequestException('El trabajador no tiene correo registrado');
        }

        const nombreCompleto = String(
            row.nombrecompleto ??
                row.nombreCompleto ??
                [row.nombres, row.apellidos].filter(Boolean).join(' ') ??
                '',
        ).trim();
        const nombre = nombreCompleto || 'Usuario';

        const frontend =
            this.configService.get<string>('FRONTEND_URLS')?.split(',')[0]?.trim() || '';
        const appName =
            this.configService.get<string>('MAIL_FROM_NAME')?.trim() || 'GVR PE';

        const { jobId } = await this.mailService.enqueue({
            templateId: 'welcome',
            to: [{ email: correo, name: nombre }],
            variables: {
                name: nombre,
                appName,
                ...(frontend ? { loginUrl: frontend } : {}),
            },
            correlationId: `demo-bienvenida-${idTrabajador}`,
        });

        return {
            idTrabajador,
            correo,
            nombre,
            jobId,
        };
    }
}
