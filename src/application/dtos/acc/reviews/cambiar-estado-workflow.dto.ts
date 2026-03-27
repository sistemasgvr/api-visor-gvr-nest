import { IsIn } from 'class-validator';

export class CambiarEstadoWorkflowDto {
    @IsIn(['ACTIVE', 'INACTIVE'])
    status: 'ACTIVE' | 'INACTIVE';
}
