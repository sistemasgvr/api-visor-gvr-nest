import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';

export interface ComentarioArchivo {
  id: number;
  contenido: string;
  idUsuarioAutor: number;
  nombreAutor: string;
  correoAutor: string;
  fechaCreacion: string;
}

export class GetComentariosArchivoUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    reviewId: number,
    fileId: number,
  ): Promise<ComentarioArchivo[]> {
    const rows = await this.reviewsRepository.getComentariosArchivoRevision<{
      id: number;
      contenido: string;
      idusuarioautor: number;
      nombreautor: string;
      correoautor: string;
      fechacreacion: string;
    }>([reviewId, fileId]);

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
