import { Injectable, Inject } from '@nestjs/common';
import type { IEmailDispatchLogRepository } from '../../../domain/repositories/email-dispatch-log.repository.interface';
import { EMAIL_DISPATCH_LOG_REPOSITORY } from '../../../domain/repositories/email-dispatch-log.repository.interface';
import { ListMailEnvioLogsQueryDto } from '../../dtos/mail-envio/list-mail-envio-query.dto';

@Injectable()
export class ListarLogsEnvioMailUseCase {
  constructor(
    @Inject(EMAIL_DISPATCH_LOG_REPOSITORY)
    private readonly dispatchLogRepository: IEmailDispatchLogRepository,
  ) {}

  execute(query: ListMailEnvioLogsQueryDto) {
    return this.dispatchLogRepository.listarLogs({
      templateId: query.templateId,
      busqueda: query.busqueda,
      status: query.status,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
