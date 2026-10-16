class PushpinPositionDto {
  x: number;

  y: number;

  z: number;
}

class ViewerStateDto {
  viewport?: any;

  objectSet?: any[];

  renderOptions?: any;
}

class LinkedDocumentDetailsDto {
  position?: PushpinPositionDto;

  objectId?: number;

  externalId?: string;

  viewable?: {
    id: string;
    viewableId: string;
    guid: string;
    name: string;
    is3D: boolean;
  };

  viewerState?: ViewerStateDto;
}

export class CrearIncidenciaDto {
  title: string;

  description: string;

  status?: string;

  issueSubtypeId: string;

  dueDate?: string;

  assignedTo?: string;

  assignedToType?: string;

  rootCauseId?: string;

  startDate?: string;

  locationId?: string;

  locationDetails?: string;

  thumbnail?: string;

  documentUrn?: string;

  itemId?: string;

  objectId?: number;

  externalId?: string;

  viewableGuid?: string;

  viewableName?: string;

  is3D?: boolean;

  pushpinPosition?: PushpinPositionDto;

  viewerState?: ViewerStateDto;
}
