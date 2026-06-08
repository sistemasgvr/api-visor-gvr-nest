import { Injectable, Inject } from '@nestjs/common';
import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { PreviewMailPlantillaDto } from '../../dtos/mail-plantilla/preview-mail-plantilla.dto';
import { MailPlantillaRenderService } from '../../../infrastructure/mail/mail-plantilla-render.service';
import { resolveMailPlantillaPreviewInput } from './mail-plantilla-preview.helper';

@Injectable()
export class PreviewMailPlantillaUseCase {
  constructor(
    @Inject(MAIL_PLANTILLA_CORREO_REPOSITORY)
    private readonly repository: IMailPlantillaCorreoRepository,
    private readonly renderService: MailPlantillaRenderService,
  ) {}

  async execute(dto: PreviewMailPlantillaDto) {
    const input = await resolveMailPlantillaPreviewInput(dto, this.repository);
    const rendered = await this.renderService.render(input);
    return {
      subject: rendered.subject,
      html: rendered.html,
      templateId: input.templateId,
    };
  }
}
