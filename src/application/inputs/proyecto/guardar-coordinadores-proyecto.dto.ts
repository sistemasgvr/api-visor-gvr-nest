export class CoordinadorItemDto {
  idtrabajador: number;

  miembrosEquipo: number[] = [];
}

export class GuardarCoordinadoresProyectoDto {
  coordinadores: CoordinadorItemDto[];
}
