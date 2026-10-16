export class UpsertDocumentMetadataDto {
  folderExternalId: string;

  itemExternalId: string;

  versionExternalId?: string;

  namingStandardId?: number;

  nombreGenerado: string;

  valores?: Record<string, unknown>;
}

export class ItemExternalIdParamDto {
  itemExternalId: string;
}
