import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class UpsertFolderNamingRuleDto {
  static readonly schema: z.ZodType<UpsertFolderNamingRuleDto> =
    defineZodDto<UpsertFolderNamingRuleDto>('UpsertFolderNamingRuleDto', {
      namingStandardId: { schema: z.number().int(), coerce: 'number' },
    });

  namingStandardId: number;
}

export class FolderExternalIdParamDto {
  static readonly schema: z.ZodType<FolderExternalIdParamDto> =
    defineZodDto<FolderExternalIdParamDto>('FolderExternalIdParamDto', {
      folderExternalId: { schema: z.string().min(1) },
    });

  folderExternalId: string;
}
