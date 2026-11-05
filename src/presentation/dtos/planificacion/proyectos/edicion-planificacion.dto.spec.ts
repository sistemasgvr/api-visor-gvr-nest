import { EditarActividadPlanDto } from './planificacion.dto';
import { UpdateEntregableProyectoDto } from '../../proyecto/update-entregable-proyecto.dto';

describe('Edición completa desde planificación', () => {
  const data = {
    revisionPlan: 3,
    revision: 2,
    datos: {
      nombre: 'Actividad editada',
      identregable: 8,
      orden: 2,
      eshito: false,
      minutosestimados: 480,
      fechanoiniciarantes: null,
      asignaciones: [{ idtrabajador: 10, minutosasignados: 480 }],
      dependencias: [{ idpredecesora: 4, desfasedias: 2 }],
    },
  };
  it('acepta recursos y dependencias en el mismo guardado', () => {
    expect(EditarActividadPlanDto.schema.parse(data)).toEqual(data);
  });
  it('admite quitar todas las dependencias', () => {
    const input = { ...data, datos: { ...data.datos, dependencias: [] } };
    expect(EditarActividadPlanDto.schema.parse(input).datos.dependencias).toEqual([]);
  });
  it('rechaza predecesoras repetidas y desfases negativos', () => {
    for (const dependencias of [
      [{ idpredecesora: 4, desfasedias: -1 }],
      [data.datos.dependencias[0], data.datos.dependencias[0]],
    ]) {
      expect(EditarActividadPlanDto.schema.safeParse({ ...data, datos: { ...data.datos, dependencias } }).success).toBe(false);
    }
  });
  it('valida el color del entregable y permite restaurar la paleta automática', () => {
    expect(UpdateEntregableProyectoDto.schema.parse({ nombre: 'Entregable', color: '#123abc' }).color).toBe('#123abc');
    expect(UpdateEntregableProyectoDto.schema.parse({ nombre: 'Entregable', color: null }).color).toBeNull();
    expect(UpdateEntregableProyectoDto.schema.safeParse({ nombre: 'Entregable', color: 'rojo' }).success).toBe(false);
  });
});
