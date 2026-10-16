import type { DatabaseFunctionService } from '../database/database-function.service';
import { PostgresInternalReviewsRepository } from './internal-reviews.repository';

describe('Persistencia de revisiones internas', () => {
  const callFunction = jest.fn().mockResolvedValue([]);
  const executeQuery = jest.fn().mockResolvedValue([]);
  const repository = new PostgresInternalReviewsRepository({
    callFunction,
    executeQuery,
  } as unknown as DatabaseFunctionService);

  beforeEach(() => jest.clearAllMocks());

  it('conserva la selección de función y el orden de parámetros de candidatos GVR y ACC', async () => {
    const gvr = [12, 'project', '[{"idUsuario":7}]', 3];
    const acc = ['workflow-id', 'project', '[{"idUsuario":7}]', 3];
    await repository.guardarCandidatos(true, gvr);
    await repository.guardarCandidatos(false, acc);
    expect(callFunction).toHaveBeenNthCalledWith(
      1,
      'acc_GuardarFlujoCandidatosGvr',
      gvr,
    );
    expect(callFunction).toHaveBeenNthCalledWith(
      2,
      'acc_GuardarWorkflowCandidatos',
      acc,
    );
  });

  it('mantiene el filtro por archivos activos y el parámetro de identificadores', async () => {
    await repository.obtenerVersionesArchivos([[2, 4]]);
    expect(executeQuery).toHaveBeenCalledWith(
      'SELECT id, urnversionacc FROM "acc_RevisionArchivo" WHERE id = ANY($1::int[]) AND estado = 1',
      [[2, 4]],
    );
  });
});
