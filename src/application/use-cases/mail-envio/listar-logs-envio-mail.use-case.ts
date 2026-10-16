import type { IEmailDispatchLogRepository } from '../../../domain/repositories/email-dispatch-log.repository.interface';
import { ListMailEnvioLogsQueryDto } from '../../inputs/mail-envio/list-mail-envio-query.dto';

export class ListarLogsEnvioMailUseCase {
  constructor(
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
