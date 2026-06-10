import { Injectable, Inject } from '@nestjs/common';
import type { IEmailDispatchLogRepository } from '../../../domain/repositories/email-dispatch-log.repository.interface';
import { EMAIL_DISPATCH_LOG_REPOSITORY } from '../../../domain/repositories/email-dispatch-log.repository.interface';
import { ListMailEnvioCoberturaQueryDto } from '../../dtos/mail-envio/list-mail-envio-query.dto';

@Injectable()
export class ListarCoberturaEnviosMailUseCase {
  constructor(
    @Inject(EMAIL_DISPATCH_LOG_REPOSITORY)
    private readonly dispatchLogRepository: IEmailDispatchLogRepository,
  ) {}

  execute(query: ListMailEnvioCoberturaQueryDto) {
    return this.dispatchLogRepository.listarCobertura({
      templateId: query.templateId,
      busqueda: query.busqueda,
      estadoEnvio: query.estadoEnvio,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
