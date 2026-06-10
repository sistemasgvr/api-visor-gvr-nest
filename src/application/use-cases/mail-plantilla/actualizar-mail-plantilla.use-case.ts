import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { UpdateMailPlantillaDto } from '../../dtos/mail-plantilla/update-mail-plantilla.dto';
import { MjmlCompilerService } from '../../../infrastructure/mail/mjml-compiler.service';
import { prepareMailPlantillaContent } from './mail-plantilla-content.helper';

@Injectable()
export class ActualizarMailPlantillaUseCase {
  constructor(
    @Inject(MAIL_PLANTILLA_CORREO_REPOSITORY)
    private readonly repository: IMailPlantillaCorreoRepository,
    private readonly mjmlCompiler: MjmlCompilerService,
  ) {}

  async execute(id: number, dto: UpdateMailPlantillaDto, idUsuario: number) {
    let cuerpoMjml: string | null | undefined;
    let cuerpoHtml: string | null | undefined;

    if (dto.cuerpoMjml !== undefined || dto.cuerpoHtml !== undefined) {
      const prepared = await prepareMailPlantillaContent(
        { cuerpoMjml: dto.cuerpoMjml, cuerpoHtml: dto.cuerpoHtml },
        this.mjmlCompiler,
      );
      cuerpoMjml = prepared.cuerpoMjml;
      cuerpoHtml = prepared.cuerpoHtml;

      // GrapesJS envía cuerpoMjml vacío: limpiar MJML obsoleto en BD (SQL distingue NULL vs '').
      if (dto.cuerpoMjml !== undefined && !dto.cuerpoMjml?.trim()) {
        cuerpoMjml = '';
      }
    }

    const resultado = await this.repository.actualizar({
      id,
      idUsuario,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      asuntoPlantilla: dto.asuntoPlantilla,
      cuerpoMjml,
      cuerpoHtml,
      designJson: dto.designJson,
      esquemaVariables: dto.esquemaVariables,
      variablesPrueba: dto.variablesPrueba,
      claveLayout: dto.claveLayout,
      estado: dto.estado,
    });

    if (!resultado.success) {
      throw new BadRequestException(
        resultado.message || 'Error al actualizar la plantilla',
      );
    }

    return {
      message: resultado.message,
      id,
      numeroVersion: resultado.numeroVersion,
    };
  }
}
