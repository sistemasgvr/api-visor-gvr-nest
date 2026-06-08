import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { MAIL_PLANTILLA_CORREO_REPOSITORY } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { CreateMailPlantillaDto } from '../../dtos/mail-plantilla/create-mail-plantilla.dto';
import { MjmlCompilerService } from '../../../infrastructure/mail/mjml-compiler.service';
import { prepareMailPlantillaContent } from './mail-plantilla-content.helper';

@Injectable()
export class CrearMailPlantillaUseCase {
  constructor(
    @Inject(MAIL_PLANTILLA_CORREO_REPOSITORY)
    private readonly repository: IMailPlantillaCorreoRepository,
    private readonly mjmlCompiler: MjmlCompilerService,
  ) {}

  async execute(dto: CreateMailPlantillaDto, idUsuario: number) {
    const { cuerpoMjml, cuerpoHtml } = await prepareMailPlantillaContent(
      { cuerpoMjml: dto.cuerpoMjml, cuerpoHtml: dto.cuerpoHtml },
      this.mjmlCompiler,
    );

    const resultado = await this.repository.crear({
      slug: dto.slug,
      nombre: dto.nombre,
      asuntoPlantilla: dto.asuntoPlantilla,
      idUsuario,
      descripcion: dto.descripcion ?? null,
      cuerpoMjml,
      cuerpoHtml,
      designJson: dto.designJson ?? null,
      esquemaVariables: dto.esquemaVariables,
      claveLayout: dto.claveLayout ?? 'base',
      esSistema: dto.esSistema ?? false,
    });

    if (!resultado.success) {
      throw new BadRequestException(
        resultado.message || 'Error al crear la plantilla',
      );
    }

    return {
      message: resultado.message,
      id: resultado.id_plantilla,
      numeroVersion: resultado.numeroVersion ?? 1,
    };
  }
}
