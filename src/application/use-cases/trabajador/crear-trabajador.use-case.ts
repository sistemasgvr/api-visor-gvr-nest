import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { CreateTrabajadorDto } from '../../inputs/trabajador/create-trabajador.dto';
import { EnviarCorreoBienvenidaUseCase } from '../mail/enviar-correo-bienvenida.use-case';

export class CrearTrabajadorUseCase {
  constructor(
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly enviarCorreoBienvenidaUseCase: EnviarCorreoBienvenidaUseCase,
  ) {}

  async execute(createDto: CreateTrabajadorDto, idUsuarioCreacion: number) {
    const { adjuntos, ...rest } = createDto as CreateTrabajadorDto & {
      adjuntos?: { idTipoAdjunto: number; ruta: string }[];
    };
    const resultado = await this.trabajadorRepository.crearTrabajador({
      ...rest,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al crear el trabajador',
      );
    }

    const idTrabajador = resultado.id_trabajador;
    if (idTrabajador && adjuntos?.length) {
      const valid = adjuntos.filter(
        (a) =>
          a?.idTipoAdjunto != null &&
          a?.ruta != null &&
          String(a.ruta).trim() !== '',
      );
      if (valid.length) {
        await this.trabajadorRepository.insertarAdjuntos(
          idTrabajador,
          valid,
          idUsuarioCreacion,
        );
      }
    }

    if (idTrabajador) {
      const nombre = `${createDto.nombres} ${createDto.apellidos}`.trim();
      await this.enviarCorreoBienvenidaUseCase.execute({
        idTrabajador,
        correo: createDto.correo,
        nombre,
      });
    }

    return {
      message: resultado.message,
      id_trabajador: resultado.id_trabajador,
      id_usuario: resultado.id_usuario,
    };
  }
}
