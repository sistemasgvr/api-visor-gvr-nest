import type {
  AsistenciaMes,
  DiaAsistencia,
} from '../../../domain/entities/asistencia.entity';
import {
  horarioBase,
  mapAsistenciaReporte,
  nombreArchivoAsistencia,
} from './asistencia-report.mapper';

const semana = { entrada: '09:00', salida: '19:00', minutosrefrigerio: 120, minutosefectivos: 480 };
const sabado = { entrada: '09:00', salida: '13:00', minutosrefrigerio: 0, minutosefectivos: 240 };

function dia(fecha: string, diasemana: number, extra: Partial<DiaAsistencia> = {}): DiaAsistencia {
  const laborable = diasemana !== 7;
  return {
    fecha,
    diasemana,
    laborable,
    esferiado: false,
    nombreferiado: null,
    programado: laborable ? (diasemana === 6 ? sabado : semana) : null,
    ingreso: null,
    salidarefrigerio: null,
    retornorefrigerio: null,
    salida: null,
    salidamarcada: null,
    salidacalculada: false,
    motivoregistro: null,
    observaciones: null,
    horasextrasautorizadas: false,
    minutoslaborados: 0,
    minutosrefrigerio: null,
    refrigerioexcedido: false,
    minutostardanza: 0,
    minutosextras: 0,
    estado: laborable ? 'sin_registro' : 'no_laborable',
    ...extra,
  };
}

const mes: AsistenciaMes = {
  trabajador: {
    id: 1,
    nombres: 'José',
    apellidos: 'Pérez Ñaupa',
    nombrecompleto: 'José Pérez Ñaupa',
    tipodocumento: 'DNI',
    nrodocumento: '00000000',
    idarea: 3,
    area: 'Obra',
    cargo: 'Administrador',
    registraasistencia: true,
    empresa: { razonsocial: 'Empresa de Ejemplo S.A.C.', ruc: '20000000000', direccion: 'Chiclayo' },
  },
  periodo: { anio: 2026, mes: 11, desde: '2026-11-01', hasta: '2026-11-30' },
  dias: [
    dia('2026-11-01', 7),
    dia('2026-11-02', 1, {
      ingreso: '09:00', salidarefrigerio: '13:00', retornorefrigerio: '15:00', salida: '19:00',
      minutoslaborados: 480, estado: 'completo',
    }),
    dia('2026-11-03', 2, {
      ingreso: '09:05', salida: '19:05', salidamarcada: '20:10', salidacalculada: true,
      minutoslaborados: 480, minutostardanza: 5, estado: 'tardanza',
    }),
    dia('2026-11-04', 3),
    dia('2026-11-07', 6, { ingreso: '09:00', salida: '13:30', minutoslaborados: 270, minutosextras: 30, estado: 'completo' }),
    dia('2026-11-09', 1, { laborable: false, esferiado: true, nombreferiado: 'Feriado de prueba', programado: null, estado: 'no_laborable' }),
  ],
  totales: {
    diaslaborables: 4, diaslaborados: 3, diassinsalida: 0,
    minutoslaborados: 1230, minutosextras: 30, minutostardanza: 5, diastardanza: 1,
  },
};

describe('mapAsistenciaReporte', () => {
  it('arma cabecera, filas laborables, totales y notas', () => {
    const datos = mapAsistenciaReporte(mes, '26/11/2026 16:30');
    expect(datos).toMatchObject({
      periodo: 'NOVIEMBRE 2026',
      mesAnio: 'NOVIEMBRE - 2026',
      razonSocial: 'EMPRESA DE EJEMPLO S.A.C.',
      trabajador: 'JOSÉ PÉREZ ÑAUPA',
      etiquetaDocumento: 'DNI',
      cargoArea: 'ADMINISTRADOR / OBRA',
      horarioBase: 'LUN-MIÉ: 09:00 - 19:00 (2h Ref.) | SÁB: 09:00 - 13:00',
      totalHoras: '20:30',
      totalExtras: '00:30',
      totalTardanza: '5',
      feriados: '09/11/2026 Feriado de prueba',
      hayAjustes: true,
      sinFilas: false,
      generado: '26/11/2026 16:30',
    });
    // Domingo y feriado sin marca no aparecen.
    expect(datos.filas.map((f) => f.fecha)).toEqual([
      '02/11/2026', '03/11/2026', '04/11/2026', '07/11/2026',
    ]);
    expect(datos.filas[1]).toMatchObject({
      dia: 'MARTES',
      salida: '19:05*',
      horasLaboradas: '08:00',
      horasExtras: '00:00',
      tardanza: '5',
    });
    expect(datos.filas[1]?.observaciones).toContain('Salida marcada 20:10');
    expect(datos.filas[2]).toMatchObject({ ingreso: '', horasLaboradas: '', resaltar: true, observaciones: 'Sin registro' });
    expect(datos.filas[3]?.horasExtras).toBe('00:30');
  });

  it('agrupa días consecutivos con el mismo horario', () => {
    const dias = [1, 2, 3, 4, 5].map((d) => dia(`2026-11-0${d + 1}`, d));
    expect(horarioBase([...dias, dia('2026-11-07', 6)])).toBe(
      'LUN-VIE: 09:00 - 19:00 (2h Ref.) | SÁB: 09:00 - 13:00',
    );
  });

  it('nombra el archivo sin tildes ni espacios', () => {
    expect(nombreArchivoAsistencia(mes, 'pdf')).toBe('asistencia-2026-11-jose-perez-naupa.pdf');
  });
});
