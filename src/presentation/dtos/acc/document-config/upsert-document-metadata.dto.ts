import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpsertDocumentMetadataDto {
  @IsString()
  @IsNotEmpty()
  folderExternalId: string;

  @IsString()
  @IsNotEmpty()
  itemExternalId: string;

  @IsOptional()
  @IsString()
  versionExternalId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  namingStandardId?: number;

  @IsString()
  @IsNotEmpty()
  nombreGenerado: string;

  @IsOptional()
  @IsObject()
  valores?: Record<string, unknown>;
}

export class ItemExternalIdParamDto {
  @IsString()
  @IsNotEmpty()
  itemExternalId: string;
}
