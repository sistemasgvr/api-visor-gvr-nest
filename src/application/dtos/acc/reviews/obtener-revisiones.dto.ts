import { IsOptional, IsString, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ObtenerRevisionesDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number;

    @IsOptional()
    @IsString()
    sort?: string;

    @IsOptional()
    @IsString()
    filter_workflowId?: string;

    @IsOptional()
    @IsString()
    filter_status?: string;

    @IsOptional()
    @IsString()
    filter_currentStepDueDate?: string;

    @IsOptional()
    @IsString()
    filter_createdAt?: string;

    @IsOptional()
    @IsString()
    filter_updatedAt?: string;

    @IsOptional()
    @IsString()
    filter_finishedAt?: string;

    @IsOptional()
    @IsString()
    filter_nextActionByUser?: string;

    @IsOptional()
    @IsString()
    filter_nextActionByRole?: string;

    @IsOptional()
    @IsString()
    filter_nextActionByCompany?: string;

    @IsOptional()
    @IsString()
    filter_name?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    filter_sequenceId?: number;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    filter_archived?: boolean;

    @IsOptional()
    @IsString()
    filter_archivedBy?: string;

    @IsOptional()
    @IsString()
    filter_archivedAt?: string;
}
