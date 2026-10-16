import { type IUsuariosRepository } from '../../../../domain/repositories/usuarios.repository.interface';

export class ObtenerUsuariosDisponiblesUseCase {
  constructor(private readonly usuariosRepository: IUsuariosRepository) {}

  async execute(
    busqueda?: string,
    limit?: number,
    offset?: number,
  ): Promise<any[]> {
    const usuarios = await this.usuariosRepository.obtenerUsuariosActivos(
      busqueda || '',
      limit || 100,
      offset || 0,
    );

    return usuarios.map((usuario) => ({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
    }));
  }
}
