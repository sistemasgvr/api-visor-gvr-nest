import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import type { IEmailDispatchLogRepository } from '../../../domain/repositories/email-dispatch-log.repository.interface';
import { EMAIL_DISPATCH_LOG_REPOSITORY } from '../../../domain/repositories/email-dispatch-log.repository.interface';
import { EMAIL_TEMPLATE_IDS } from '../../../domain/mail/email-template-id';
import { ReenviarPendientesMailEnvioDto } from '../../dtos/mail-envio/reenviar-mail-envio.dto';
import { ReenviarMailEnvioUseCase } from './reenviar-mail-envio.use-case';

const MAX_BULK_RESEND = 50;

@Injectable()
export class ReenviarPendientesMailEnvioUseCase {
  constructor(
    @Inject(EMAIL_DISPATCH_LOG_REPOSITORY)
    private readonly dispatchLogRepository: IEmailDispatchLogRepository,
    private readonly reenviarMailEnvioUseCase: ReenviarMailEnvioUseCase,
  ) {}

  async execute(dto: ReenviarPendientesMailEnvioDto) {
    if (dto.templateId !== EMAIL_TEMPLATE_IDS.WELCOME) {
      throw new BadRequestException(
        `Envío masivo no disponible para la plantilla "${dto.templateId}"`,
      );
    }

    let ids = dto.idTrabajadores ?? [];

    if (!ids.length) {
      const [noEnviados, fallidos] = await Promise.all([
        this.dispatchLogRepository.listarCobertura({
          templateId: dto.templateId,
          estadoEnvio: 'no_enviado',
          limit: MAX_BULK_RESEND,
          offset: 0,
        }),
        this.dispatchLogRepository.listarCobertura({
          templateId: dto.templateId,
          estadoEnvio: 'failed',
          limit: MAX_BULK_RESEND,
          offset: 0,
        }),
      ]);

      const merged = [...noEnviados.data, ...fallidos.data];
      const unique = new Map<number, (typeof merged)[number]>();
      for (const item of merged) {
        unique.set(item.idTrabajador, item);
      }

      ids = [...unique.values()]
        .map((item) => item.idTrabajador)
        .slice(0, MAX_BULK_RESEND);
    }

    if (!ids.length) {
      return {
        message: 'No hay trabajadores pendientes de envío',
        encolados: 0,
        fallidos: 0,
        detalle: [] as { idTrabajador: number; ok: boolean; error?: string }[],
      };
    }

    if (ids.length > MAX_BULK_RESEND) {
      throw new BadRequestException(
        `Máximo ${MAX_BULK_RESEND} reenvíos por solicitud`,
      );
    }

    const detalle: { idTrabajador: number; ok: boolean; error?: string }[] = [];
    let encolados = 0;
    let fallidos = 0;

    for (const idTrabajador of ids) {
      try {
        await this.reenviarMailEnvioUseCase.execute({
          templateId: dto.templateId,
          idTrabajador,
        });
        encolados++;
        detalle.push({ idTrabajador, ok: true });
      } catch (err) {
        fallidos++;
        const message = err instanceof Error ? err.message : String(err);
        detalle.push({ idTrabajador, ok: false, error: message });
      }
    }

    return {
      message: `Procesados ${ids.length} trabajador(es): ${encolados} encolado(s), ${fallidos} fallido(s)`,
      encolados,
      fallidos,
      detalle,
    };
  }
}
