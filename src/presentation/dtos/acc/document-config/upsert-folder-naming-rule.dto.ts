import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpsertFolderNamingRuleDto {
  @Type(() => Number)
  @IsInt()
  namingStandardId: number;
}

export class FolderExternalIdParamDto {
  @IsString()
  @IsNotEmpty()
  folderExternalId: string;
}
