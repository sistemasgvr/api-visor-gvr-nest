import type { IEmailDispatchLogRepository } from '../../../domain/repositories/email-dispatch-log.repository.interface';
import { ListMailEnvioCoberturaQueryDto } from '../../inputs/mail-envio/list-mail-envio-query.dto';

export class ListarCoberturaEnviosMailUseCase {
  constructor(
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
