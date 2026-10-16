export class UploadVisorElementoFotoDto {
  idProyectoAcc?: string;

  itemId: string;

  /** id del anclaje en BD, o objectId Forge si aún no existe anclaje */

  identificador: number;

  dia: string;

  indiceFoto?: number;
}
