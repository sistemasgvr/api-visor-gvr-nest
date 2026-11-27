import type { IControlAsistenciaRepository } from '../../../domain/repositories/control-asistencia.repository.interface';
import type { TipoMarcaAsistencia } from '../../../domain/entities/asistencia.entity';
import { InvalidInputError } from '../../errors/application.error';
import { MarcarAsistenciaUseCase } from './marcar-asistencia.use-case';
import { ListarAsistenciaMesUseCase } from './listar-asistencia-mes.use-case';
import { ObtenerEstadoAsistenciaUseCase } from './obtener-estado-asistencia.use-case';
import { ExportarAsistenciaPdfUseCase } from './exportar-asistencia-pdf.use-case';

function repositorio(): jest.Mocked<IControlAsistenciaRepository> {
  return {
    obtenerEstado: jest.fn().mockResolvedValue({ habilitado: true }),
    marcar: jest.fn().mockResolvedValue({ habilitado: true }),
    listarMes: jest.fn().mockResolvedValue({ dias: [] }),
  } as unknown as jest.Mocked<IControlAsistenciaRepository>;
}

describe('Casos de uso de control de asistencia', () => {
  it('obtiene el estado del propio usuario', async () => {
    const repo = repositorio();
    await new ObtenerEstadoAsistenciaUseCase(repo).execute(7);
    expect(repo.obtenerEstado).toHaveBeenCalledWith(7);
  });

  it('marca con el motivo recortado y sin motivo vacío', async () => {
    const repo = repositorio();
    const caso = new MarcarAsistenciaUseCase(repo);
    await caso.execute(7, 'salida', '  Falla de internet  ');
    await caso.execute(7, 'ingreso', '   ');
    await caso.execute(7, 'salida_refrigerio');
    expect(repo.marcar).toHaveBeenNthCalledWith(1, 7, 'salida', 'Falla de internet');
    expect(repo.marcar).toHaveBeenNthCalledWith(2, 7, 'ingreso', null);
    expect(repo.marcar).toHaveBeenNthCalledWith(3, 7, 'salida_refrigerio', null);
  });

  it('rechaza un tipo de marca desconocido sin llamar al repositorio', () => {
    const repo = repositorio();
    expect(() =>
      new MarcarAsistenciaUseCase(repo).execute(7, 'extra' as TipoMarcaAsistencia),
    ).toThrow(InvalidInputError);
    expect(repo.marcar).not.toHaveBeenCalled();
  });

  it('genera el PDF con la asistencia del mes indicado', async () => {
    const repo = repositorio();
    const archivo = { contenido: Buffer.from('%PDF'), nombreArchivo: 'a.pdf' };
    const reporte = { generar: jest.fn().mockResolvedValue(archivo) };
    await expect(
      new ExportarAsistenciaPdfUseCase(repo, reporte).execute(7, 15, 2026, 11),
    ).resolves.toBe(archivo);
    expect(repo.listarMes).toHaveBeenCalledWith(7, 15, 2026, 11);
    expect(reporte.generar).toHaveBeenCalledWith({ dias: [] });
  });

  it('lista el mes propio o de otro colaborador', async () => {
    const repo = repositorio();
    const caso = new ListarAsistenciaMesUseCase(repo);
    await caso.execute(7, null, 2026, 11);
    await caso.execute(7, 15, 2026, 11);
    expect(repo.listarMes).toHaveBeenNthCalledWith(1, 7, null, 2026, 11);
    expect(repo.listarMes).toHaveBeenNthCalledWith(2, 7, 15, 2026, 11);
  });
});
