import { EMAIL_TEMPLATE_IDS } from '../../../domain/mail/email-template-id';
import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import {
  InvalidInputError,
  NotFoundError,
} from '../../errors/application.error';
import { ReenviarMailEnvioDto } from '../../inputs/mail-envio/reenviar-mail-envio.dto';
import { EnviarCorreoBienvenidaUseCase } from '../mail/enviar-correo-bienvenida.use-case';

export class ReenviarMailEnvioUseCase {
  constructor(
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly enviarCorreoBienvenidaUseCase: EnviarCorreoBienvenidaUseCase,
  ) {}

  async execute(dto: ReenviarMailEnvioDto) {
    const trabajador = await this.trabajadorRepository.obtenerTrabajadorPorId(
      dto.idTrabajador,
    );
    if (!trabajador) {
      throw new NotFoundError('Trabajador no encontrado');
    }

    if (dto.templateId === EMAIL_TEMPLATE_IDS.WELCOME) {
      const correo = String(
        trabajador.correo ?? trabajador.Correo ?? '',
      ).trim();
      if (!correo) {
        throw new InvalidInputError('El trabajador no tiene correo registrado');
      }

      const nombreCompleto = String(
        trabajador.nombrecompleto ??
          trabajador.nombreCompleto ??
          [trabajador.nombres, trabajador.apellidos]
            .filter(Boolean)
            .join(' ') ??
          '',
      ).trim();
      const nombre = nombreCompleto || 'Usuario';

      const result = await this.enviarCorreoBienvenidaUseCase.execute({
        idTrabajador: dto.idTrabajador,
        correo,
        nombre,
        correlationIdPrefix: 'bienvenida-trabajador-reenvio',
      });

      if (!result.sent) {
        throw new InvalidInputError(
          result.skippedReason ?? 'No se pudo encolar el correo',
        );
      }

      return {
        message: `Correo de bienvenida encolado para ${correo}`,
        jobId: result.jobId,
      };
    }

    throw new InvalidInputError(
      `Reenvío manual no disponible para la plantilla "${dto.templateId}"`,
    );
  }
}
