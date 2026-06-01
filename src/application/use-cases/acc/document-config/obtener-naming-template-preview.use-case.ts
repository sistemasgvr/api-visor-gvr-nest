import { BadRequestException, Injectable } from '@nestjs/common';

type TemplateCode = 'iso19650';

@Injectable()
export class ObtenerNamingTemplatePreviewUseCase {
  execute(templateCode: string) {
    const normalized = String(templateCode ?? '').toLowerCase() as TemplateCode;

    if (normalized !== 'iso19650') {
      throw new BadRequestException('Plantilla no soportada');
    }

    return {
      templateCode: 'iso19650',
      templateName: 'ISO 19650',
      description:
        'Plantilla base de convención documental alineada a ISO 19650 para iniciar rápidamente.',
      suggestedSeparator: '-',
      previewPattern: 'project-originator-volume-level-type-role-number.{ext}',
      conventionAttributes: [
        {
          codigo: 'project',
          nombre: 'Proyecto',
          tipo: 'text',
          required: true,
          descripcion: 'Identificador del proyecto',
        },
        {
          codigo: 'originator',
          nombre: 'Creador',
          tipo: 'text',
          required: true,
          descripcion: 'Origen / empresa responsable',
        },
        {
          codigo: 'volume',
          nombre: 'Volumen/Sistema',
          tipo: 'text',
          required: true,
        },
        {
          codigo: 'level',
          nombre: 'Nivel/Ubicación',
          tipo: 'text',
          required: true,
        },
        {
          codigo: 'type',
          nombre: 'Tipo',
          tipo: 'text',
          required: true,
        },
        {
          codigo: 'role',
          nombre: 'Función/Rol',
          tipo: 'text',
          required: true,
        },
        {
          codigo: 'number',
          nombre: 'Número',
          tipo: 'text',
          required: true,
        },
      ],
      relatedAttributes: [
        {
          codigo: 'status',
          nombre: 'Estado',
          tipo: 'dropdown',
          required: true,
          opciones: ['S0', 'S1', 'S2', 'A1', 'A2'],
        },
        {
          codigo: 'revision',
          nombre: 'Revisión',
          tipo: 'text',
          required: false,
        },
        {
          codigo: 'classification',
          nombre: 'Clasificación',
          tipo: 'text',
          required: false,
        },
      ],
    };
  }
}
