import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import type { PreviewMailPlantillaDto } from '../../dtos/mail-plantilla/preview-mail-plantilla.dto';
import type { MailPlantillaRenderInput } from '../../../infrastructure/mail/mail-plantilla-render.service';

function pickNonEmpty(
  ...values: Array<string | null | undefined>
): string | null | undefined {
  for (const value of values) {
    if (value === undefined) continue;
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

export async function resolveMailPlantillaPreviewInput(
  dto: PreviewMailPlantillaDto,
  repository: IMailPlantillaCorreoRepository,
): Promise<MailPlantillaRenderInput & { templateId: string }> {
  if (dto.id != null) {
    const plantilla = await repository.obtenerPorId(dto.id);
    if (!plantilla) {
      throw new NotFoundException('Plantilla de correo no encontrada');
    }
    return {
      templateId: plantilla.slug,
      asuntoPlantilla: dto.asuntoPlantilla ?? plantilla.asuntoPlantilla,
      cuerpoMjml: pickNonEmpty(dto.cuerpoMjml, plantilla.cuerpoMjml),
      cuerpoHtml: pickNonEmpty(dto.cuerpoHtml, plantilla.cuerpoHtml),
      claveLayout: dto.claveLayout ?? plantilla.claveLayout,
      variables: dto.variables,
    };
  }

  if (dto.slug?.trim()) {
    const plantilla = await repository.obtenerPorSlug(dto.slug.trim(), false);
    if (plantilla) {
      return {
        templateId: plantilla.slug,
        asuntoPlantilla: dto.asuntoPlantilla ?? plantilla.asuntoPlantilla,
        cuerpoMjml: pickNonEmpty(dto.cuerpoMjml, plantilla.cuerpoMjml),
        cuerpoHtml: pickNonEmpty(dto.cuerpoHtml, plantilla.cuerpoHtml),
        claveLayout: dto.claveLayout ?? plantilla.claveLayout,
        variables: dto.variables,
      };
    }
  }

  const asuntoPlantilla = dto.asuntoPlantilla?.trim();
  if (!asuntoPlantilla) {
    throw new BadRequestException(
      'Indique id, slug o asuntoPlantilla con cuerpo para la vista previa',
    );
  }

  return {
    templateId: dto.slug?.trim() || 'preview-inline',
    asuntoPlantilla,
    cuerpoMjml: pickNonEmpty(dto.cuerpoMjml),
    cuerpoHtml: pickNonEmpty(dto.cuerpoHtml),
    claveLayout: dto.claveLayout ?? 'base',
    variables: dto.variables,
  };
}
