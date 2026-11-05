import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class UpsertDocumentMetadataDto {
  static readonly schema: z.ZodType<UpsertDocumentMetadataDto> =
    defineZodDto<UpsertDocumentMetadataDto>('UpsertDocumentMetadataDto', {
      folderExternalId: { schema: z.string().min(1) },
      itemExternalId: { schema: z.string().min(1) },
      versionExternalId: { schema: z.string(), optional: true },
      namingStandardId: {
        schema: z.number().int(),
        optional: true,
        coerce: 'number',
      },
      nombreGenerado: { schema: z.string().min(1) },
      valores: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  folderExternalId: string;

  itemExternalId: string;

  versionExternalId?: string;

  namingStandardId?: number;

  nombreGenerado: string;

  valores?: Record<string, unknown>;
}

export class ItemExternalIdParamDto {
  static readonly schema: z.ZodType<ItemExternalIdParamDto> =
    defineZodDto<ItemExternalIdParamDto>('ItemExternalIdParamDto', {
      itemExternalId: { schema: z.string().min(1) },
    });

  itemExternalId: string;
}
