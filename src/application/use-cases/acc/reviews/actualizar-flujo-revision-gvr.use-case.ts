import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';
import { CrearWorkflowDto } from '../../../dtos/acc/reviews/crear-workflow.dto';
import { buildFlujoRevisionPayload } from './build-flujo-revision-payload';

export interface ActualizarFlujoRevisionGvrResult {
  id: string;
  name: string;
  idProyectoAcc: string;
  mensaje: string;
}

@Injectable()
export class ActualizarFlujoRevisionGvrUseCase {
  constructor(private readonly dbFunctionService: DatabaseFunctionService) {}

  async execute(
    userId: number,
    projectId: string,
    workflowId: string,
    dto: CrearWorkflowDto,
  ): Promise<ActualizarFlujoRevisionGvrResult> {
    const flowId = parseInt(workflowId, 10);
    if (Number.isNaN(flowId)) {
      throw new BadRequestException(
        'Solo se pueden actualizar flujos internos GVR (id numérico).',
      );
    }

    const steps = dto.steps ?? [];
    if (steps.length === 0) {
      throw new BadRequestException(
        'Debe incluir al menos un paso (iniciador).',
      );
    }

    let estadoNombre: 'Activo' | 'Borrador';
    if (dto.workflowStatus === 'ACTIVE') estadoNombre = 'Activo';
    else if (dto.workflowStatus === 'INACTIVE') estadoNombre = 'Borrador';
    else {
      const current = await this.dbFunctionService.callFunctionSingle<{
        status: string;
      }>('acc_ObtenerFlujoTrabajoAprobacionGvrPorId', [projectId, flowId]);
      if (!current) {
        throw new BadRequestException('Flujo no encontrado.');
      }
      estadoNombre = current.status === 'INACTIVE' ? 'Borrador' : 'Activo';
    }

    const payload = buildFlujoRevisionPayload(dto, estadoNombre);

    let result: {
      id: number;
      nombre: string;
      idProyectoAcc: string;
      mensaje: string;
    }[];
    try {
      result = await this.dbFunctionService.callFunction<{
        id: number;
        nombre: string;
        idProyectoAcc: string;
        mensaje: string;
      }>('acc_ActualizarFlujoRevision', [
        projectId,
        userId,
        flowId,
        JSON.stringify(payload),
      ]);
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      throw new BadRequestException(
        msg.includes('listado') ||
          msg.includes('violates') ||
          msg.includes('no encontrado')
          ? 'Error al actualizar el flujo: verifique datos y seeds de listados (acc_flujo_*).'
          : msg,
      );
    }

    const row = result?.[0];
    if (!row?.id) {
      throw new BadRequestException(
        row?.mensaje ?? 'No se pudo actualizar el flujo de trabajo.',
      );
    }

    return {
      id: String(row.id),
      name: row.nombre ?? dto.name,
      idProyectoAcc: row.idProyectoAcc ?? projectId,
      mensaje: row.mensaje ?? 'Flujo actualizado correctamente.',
    };
  }
}
