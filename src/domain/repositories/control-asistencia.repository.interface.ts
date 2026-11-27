import type {
  AsistenciaMes,
  EstadoAsistencia,
  TipoMarcaAsistencia,
} from '../entities/asistencia.entity';

export const CONTROL_ASISTENCIA_REPOSITORY = Symbol(
  'CONTROL_ASISTENCIA_REPOSITORY',
);

export interface IControlAsistenciaRepository {
  obtenerEstado(idUsuario: number): Promise<EstadoAsistencia>;
  marcar(
    idUsuario: number,
    tipo: TipoMarcaAsistencia,
    motivo: string | null,
  ): Promise<EstadoAsistencia>;
  listarMes(
    idUsuario: number,
    idTrabajador: number | null,
    anio: number,
    mes: number,
  ): Promise<AsistenciaMes>;
}
