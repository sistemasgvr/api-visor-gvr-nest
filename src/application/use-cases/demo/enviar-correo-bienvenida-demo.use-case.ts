import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { TRABAJADOR_REPOSITORY } from '../../../domain/repositories/trabajador.repository.interface';
import { EnviarCorreoBienvenidaUseCase } from '../mail/enviar-correo-bienvenida.use-case';

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
    private readonly enviarCorreoBienvenidaUseCase: EnviarCorreoBienvenidaUseCase,
  ) {}

  async execute(
    idTrabajador: number,
  ): Promise<EnviarCorreoBienvenidaDemoResult> {
    if (idTrabajador == null || idTrabajador < 1) {
      throw new BadRequestException('idTrabajador inválido');
    }

    const row =
      await this.trabajadorRepository.obtenerTrabajadorPorId(idTrabajador);
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

    const { sent, jobId, skippedReason } =
      await this.enviarCorreoBienvenidaUseCase.execute({
        idTrabajador,
        correo,
        nombre,
        correlationIdPrefix: 'demo-bienvenida',
      });

    if (!sent) {
      throw new BadRequestException(
        skippedReason || 'No se pudo encolar el correo de bienvenida',
      );
    }

    return {
      idTrabajador,
      correo,
      nombre,
      jobId,
    };
  }
}
