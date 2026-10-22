import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

class PushpinPositionDto {
  static readonly schema: z.ZodType<PushpinPositionDto> =
    defineZodDto<PushpinPositionDto>('PushpinPositionDto', {
      x: { schema: z.number() },
      y: { schema: z.number() },
      z: { schema: z.number() },
    });

  x: number;

  y: number;

  z: number;
}

class ViewerStateDto {
  static readonly schema: z.ZodType<ViewerStateDto> =
    defineZodDto<ViewerStateDto>('ViewerStateDto', {
      viewport: { schema: z.record(z.string(), z.unknown()), optional: true },
      objectSet: { schema: z.array(z.unknown()), optional: true },
      renderOptions: {
        schema: z.record(z.string(), z.unknown()),
        optional: true,
      },
    });

  viewport?: any;

  objectSet?: any[];

  renderOptions?: any;
}

class LinkedDocumentDetailsDto {
  static readonly schema: z.ZodType<LinkedDocumentDetailsDto> =
    defineZodDto<LinkedDocumentDetailsDto>('LinkedDocumentDetailsDto', {
      position: {
        schema: z.lazy(() => PushpinPositionDto.schema),
        optional: true,
      },
      objectId: { schema: z.number(), optional: true },
      externalId: { schema: z.string(), optional: true },
      viewable: { schema: z.record(z.string(), z.unknown()), optional: true },
      viewerState: {
        schema: z.record(z.string(), z.unknown()),
        optional: true,
      },
    });

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
  static readonly schema: z.ZodType<CrearIncidenciaDto> =
    defineZodDto<CrearIncidenciaDto>('acc_issues_CrearIncidenciaDto', {
      title: { schema: z.string() },
      description: { schema: z.string() },
      status: { schema: z.string(), optional: true },
      issueSubtypeId: { schema: z.string() },
      dueDate: { schema: z.string(), optional: true },
      assignedTo: { schema: z.string(), optional: true },
      assignedToType: { schema: z.string(), optional: true },
      rootCauseId: { schema: z.string(), optional: true },
      startDate: { schema: z.string(), optional: true },
      locationId: { schema: z.string(), optional: true },
      locationDetails: { schema: z.string(), optional: true },
      thumbnail: { schema: z.string(), optional: true },
      documentUrn: { schema: z.string(), optional: true },
      itemId: { schema: z.string(), optional: true },
      objectId: { schema: z.number(), optional: true },
      externalId: { schema: z.string(), optional: true },
      viewableGuid: { schema: z.string(), optional: true },
      viewableName: { schema: z.string(), optional: true },
      is3D: { schema: z.boolean(), optional: true },
      pushpinPosition: {
        schema: z.lazy(() => PushpinPositionDto.schema),
        optional: true,
      },
      viewerState: {
        schema: z.lazy(() => ViewerStateDto.schema),
        optional: true,
      },
    });

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
