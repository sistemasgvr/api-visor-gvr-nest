import { InvalidInputError } from '../../../errors/application.error';
import { CrearWorkflowDto } from '../../../inputs/acc/reviews/crear-workflow.dto';
import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';
import {
  buildFlujoRevisionPayload,
  resolveEstadoFlujoNombre,
} from './build-flujo-revision-payload';

export interface CrearFlujoRevisionGvrResult {
  id: string;
  name: string;
  idProyectoAcc: string;
  mensaje: string;
}

/**
 * Crea un flujo de trabajo de aprobación en la BD GVR mediante acc_CrearFlujoRevision.
 */

export class CrearFlujoRevisionGvrUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    userId: number,
    projectId: string,
    dto: CrearWorkflowDto,
  ): Promise<CrearFlujoRevisionGvrResult> {
    const steps = dto.steps ?? [];
    if (steps.length === 0) {
      throw new InvalidInputError('Debe incluir al menos un paso (iniciador).');
    }

    const estadoNombre = resolveEstadoFlujoNombre(dto);
    const payload = buildFlujoRevisionPayload(dto, estadoNombre);

    let result: {
      id: number;
      nombre: string;
      idProyectoAcc: string;
      mensaje: string;
    }[];
    try {
      result = await this.reviewsRepository.crearFlujoRevision<{
        id: number;
        nombre: string;
        idProyectoAcc: string;
        mensaje: string;
      }>([projectId, userId, JSON.stringify(payload)]);
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      throw new InvalidInputError(
        msg.includes('listado') || msg.includes('violates')
          ? 'Error al crear el flujo: verifique datos y seeds de listados (acc_flujo_*).'
          : msg,
      );
    }

    const row = result?.[0];
    if (!row?.id) {
      throw new InvalidInputError(
        row?.mensaje ?? 'No se pudo crear el flujo de trabajo.',
      );
    }

    return {
      id: String(row.id),
      name: row.nombre ?? dto.name,
      idProyectoAcc: row.idProyectoAcc ?? projectId,
      mensaje: row.mensaje ?? 'Flujo creado correctamente.',
    };
  }
}
