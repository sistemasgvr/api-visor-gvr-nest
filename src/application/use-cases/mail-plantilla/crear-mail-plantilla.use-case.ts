import type { IMailPlantillaCorreoRepository } from '../../../domain/repositories/mail-plantilla-correo.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { CreateMailPlantillaDto } from '../../inputs/mail-plantilla/create-mail-plantilla.dto';
import { MjmlCompilerPort } from '../../ports/mjml-compiler.port';
import { prepareMailPlantillaContent } from './mail-plantilla-content.helper';

export class CrearMailPlantillaUseCase {
  constructor(
    private readonly repository: IMailPlantillaCorreoRepository,
    private readonly mjmlCompiler: MjmlCompilerPort,
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
      variablesPrueba: dto.variablesPrueba,
      claveLayout: dto.claveLayout ?? 'base',
      esSistema: dto.esSistema ?? false,
    });

    if (!resultado.success) {
      throw new InvalidInputError(
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
