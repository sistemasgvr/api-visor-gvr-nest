import { IsString, IsNotEmpty, IsOptional, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearWorkflowDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(4096)
    description?: string;

    @IsOptional()
    @IsString()
    @MaxLength(4096)
    notes?: string;

    @IsOptional()
    additionalOptions?: {
        allowInitiatorToEdit?: boolean;
    };

    @IsOptional()
    @IsArray()
    steps?: any[];

    @IsOptional()
    @IsArray()
    approvalStatusOptions?: any[];

    @IsOptional()
    @IsArray()
    additionalApprovalStatusOptions?: { label: string; value: string }[];

    @IsOptional()
    copyFilesOptions?: any;

    @IsOptional()
    @IsArray()
    attachedAttributes?: any[];

    @IsOptional()
    updateAttributesOptions?: any;
}
