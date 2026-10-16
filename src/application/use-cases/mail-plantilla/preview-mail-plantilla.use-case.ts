import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { PreviewMailPlantillaDto } from '../../inputs/mail-plantilla/preview-mail-plantilla.dto';
import { MailPlantillaRenderPort } from '../../ports/mail-plantilla-render.port';
import { resolveMailPlantillaPreviewInput } from './mail-plantilla-preview.helper';

export class PreviewMailPlantillaUseCase {
  constructor(
    private readonly repository: IMailPlantillaCorreoRepository,
    private readonly renderService: MailPlantillaRenderPort,
  ) {}

  async execute(dto: PreviewMailPlantillaDto) {
    const input = await resolveMailPlantillaPreviewInput(dto, this.repository);
    const rendered = await this.renderService.render(input);
    return {
      subject: rendered.subject,
      html: rendered.html,
      templateId: input.templateId,
      mjmlWarnings: rendered.mjmlWarnings,
    };
  }
}
