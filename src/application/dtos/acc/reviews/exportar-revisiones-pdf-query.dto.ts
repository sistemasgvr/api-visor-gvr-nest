import { IsOptional, IsString } from 'class-validator';

/** Mismos filtros que GET /reviews; sin paginación (el export recorre todas las páginas). */
export class ExportarRevisionesPdfQueryDto {
    @IsOptional()
    @IsString()
    filter_status?: string;

    @IsOptional()
    @IsString()
    filter_name?: string;

    @IsOptional()
    @IsString()
    filter_createdAt?: string;

    @IsOptional()
    @IsString()
    filter_finishedAt?: string;

    @IsOptional()
    @IsString()
    filter_currentStepDueDate?: string;

    @IsOptional()
    @IsString()
    filter_workflowId?: string;
}
