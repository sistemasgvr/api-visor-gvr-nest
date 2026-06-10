import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../services/mail.service';
import { EMAIL_TEMPLATE_IDS } from '../../../domain/mail/email-template-id';

export interface EnviarCorreoBienvenidaInput {
  idTrabajador: number;
  correo: string;
  nombre: string;
  correlationIdPrefix?: string;
}

export interface EnviarCorreoBienvenidaResult {
  sent: boolean;
  jobId?: string;
  skippedReason?: string;
}

@Injectable()
export class EnviarCorreoBienvenidaUseCase {
  private readonly logger = new Logger(EnviarCorreoBienvenidaUseCase.name);

  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    input: EnviarCorreoBienvenidaInput,
  ): Promise<EnviarCorreoBienvenidaResult> {
    const correo = input.correo.trim();
    if (!correo) {
      return { sent: false, skippedReason: 'sin_correo' };
    }

    const nombre = input.nombre.trim() || 'Usuario';
    const appName =
      this.configService.get<string>('MAIL_FROM_NAME')?.trim() || 'GVR PE';
    const prefix = input.correlationIdPrefix ?? 'bienvenida-trabajador';

    try {
      const { jobId } = await this.mailService.enqueue({
        templateId: EMAIL_TEMPLATE_IDS.WELCOME,
        to: [{ email: correo, name: nombre }],
        variables: {
          name: nombre,
          appName,
          userEmail: correo,
        },
        correlationId: `${prefix}-${input.idTrabajador}`,
      });

      return { sent: true, jobId };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `No se pudo encolar correo de bienvenida para trabajador ${input.idTrabajador} (${correo}): ${message}`,
      );
      return { sent: false, skippedReason: message };
    }
  }
}
