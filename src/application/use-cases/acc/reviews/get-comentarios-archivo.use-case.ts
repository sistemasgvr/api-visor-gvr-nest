import { Injectable } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

export interface ComentarioArchivo {
  id: number;
  contenido: string;
  idUsuarioAutor: number;
  nombreAutor: string;
  correoAutor: string;
  fechaCreacion: string;
}

@Injectable()
export class GetComentariosArchivoUseCase {
  constructor(private readonly dbFunctionService: DatabaseFunctionService) {}

  async execute(
    reviewId: number,
    fileId: number,
  ): Promise<ComentarioArchivo[]> {
    const rows = await this.dbFunctionService.callFunction<{
      id: number;
      contenido: string;
      idusuarioautor: number;
      nombreautor: string;
      correoautor: string;
      fechacreacion: string;
    }>('acc_GetComentariosArchivoRevision', [reviewId, fileId]);

    return (rows ?? []).map((r) => ({
      id: r.id,
      contenido: r.contenido,
      idUsuarioAutor: r.idusuarioautor,
      nombreAutor: r.nombreautor ?? 'Usuario',
      correoAutor: r.correoautor ?? '',
      fechaCreacion: r.fechacreacion,
    }));
  }
}
