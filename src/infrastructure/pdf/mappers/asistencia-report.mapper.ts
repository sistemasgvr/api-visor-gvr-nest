import type {
  AsistenciaMes,
  DiaAsistencia,
} from '../../../domain/entities/asistencia.entity';

/**
 * Adapta la asistencia mensual a los datos de la plantilla control-asistencia-report.
 * Función pura: sin consultas ni zona horaria del servidor (las fechas llegan como YYYY-MM-DD).
 */

const DIAS = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
const DIAS_CORTOS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];

export interface FilaReporteAsistencia {
  numero: number;
  fecha: string;
  dia: string;
  ingreso: string;
  salidaRefrigerio: string;
  retornoRefrigerio: string;
  salida: string;
  horasLaboradas: string;
  horasExtras: string;
  tardanza: string;
  observaciones: string;
  resaltar: boolean;
}

export interface DatosReporteAsistencia {
  [clave: string]: unknown;
  titulo: string;
  periodo: string;
  mesAnio: string;
  razonSocial: string;
  ruc: string;
  domicilio: string;
  trabajador: string;
  etiquetaDocumento: string;
  documento: string;
  cargoArea: string;
  horarioBase: string;
  filas: FilaReporteAsistencia[];
  sinFilas: boolean;
  totalTexto: string;
  totalHoras: string;
  totalExtras: string;
  totalTardanza: string;
  feriados: string;
  hayAjustes: boolean;
  generado: string;
}

const mayus = (texto: string | null | undefined) =>
  (texto ?? '').toLocaleUpperCase('es-PE');

export function fechaCorta(fecha: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : fecha;
}

/** 495 → "08:15". */
export function horasMinutos(minutos: number): string {
  const total = Math.max(0, Math.round(minutos));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function textoRefrigerio(minutos: number): string {
  if (!minutos) return '';
  if (minutos % 60 === 0) return ` (${minutos / 60}h Ref.)`;
  return ` (${Math.floor(minutos / 60)}h ${String(minutos % 60).padStart(2, '0')}min Ref.)`;
}

/** "LUN-VIE: 09:00 - 19:00 (2h Ref.) | SÁB: 09:00 - 13:00". */
export function horarioBase(dias: DiaAsistencia[]): string {
  const porDia = new Map<number, string>();
  for (const dia of dias) {
    const p = dia.programado;
    if (!dia.laborable || !p?.entrada || porDia.has(dia.diasemana)) continue;
    porDia.set(
      dia.diasemana,
      `${p.entrada} - ${p.salida}${textoRefrigerio(p.minutosrefrigerio)}`,
    );
  }
  const grupos: { desde: number; hasta: number; texto: string }[] = [];
  for (let d = 1; d <= 7; d++) {
    const texto = porDia.get(d);
    if (!texto) continue;
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.texto === texto && ultimo.hasta === d - 1) ultimo.hasta = d;
    else grupos.push({ desde: d, hasta: d, texto });
  }
  return grupos
    .map(
      (g) =>
        `${g.desde === g.hasta ? DIAS_CORTOS[g.desde - 1] : `${DIAS_CORTOS[g.desde - 1]}-${DIAS_CORTOS[g.hasta - 1]}`}: ${g.texto}`,
    )
    .join(' | ');
}

export function observacionDia(dia: DiaAsistencia): string {
  const partes: string[] = [];
  if (dia.estado === 'sin_registro') partes.push('Sin registro');
  if (dia.estado === 'sin_salida') partes.push('Sin salida registrada');
  if (dia.salidacalculada)
    partes.push(
      dia.salidamarcada
        ? `Salida marcada ${dia.salidamarcada}, ajustada al fin de la jornada`
        : 'Salida calculada al registrarla después',
    );
  if (dia.refrigerioexcedido) partes.push('Refrigerio excedido');
  if (dia.motivoregistro) partes.push(`Motivo: ${dia.motivoregistro}`);
  if (dia.observaciones) partes.push(dia.observaciones);
  return partes.join('. ');
}

export function mapAsistenciaReporte(
  mes: AsistenciaMes,
  generado: string,
): DatosReporteAsistencia {
  const { trabajador, periodo, totales } = mes;
  const nombreMes = MESES[periodo.mes - 1] ?? '';
  const nombrePeriodo = `${nombreMes} ${periodo.anio}`;
  const dias = mes.dias.filter((d) => d.laborable || d.ingreso);
  const feriados = mes.dias.filter((d) => d.esferiado);

  const filas = dias.map((dia, i): FilaReporteAsistencia => {
    const conSalida = !!dia.salida;
    return {
      numero: i + 1,
      fecha: fechaCorta(dia.fecha),
      dia: DIAS[dia.diasemana - 1] ?? '',
      ingreso: dia.ingreso ?? '',
      salidaRefrigerio: dia.salidarefrigerio ?? '',
      retornoRefrigerio: dia.retornorefrigerio ?? '',
      salida: dia.salida ? `${dia.salida}${dia.salidacalculada ? '*' : ''}` : '',
      horasLaboradas: conSalida ? horasMinutos(dia.minutoslaborados) : '',
      horasExtras: conSalida && dia.minutosextras ? horasMinutos(dia.minutosextras) : conSalida ? '00:00' : '',
      tardanza: dia.ingreso ? String(dia.minutostardanza) : '',
      observaciones: observacionDia(dia),
      resaltar: dia.estado === 'sin_salida' || dia.estado === 'sin_registro',
    };
  });

  return {
    titulo: 'REGISTRO DE CONTROL DE ASISTENCIA Y SALIDA',
    periodo: nombrePeriodo,
    mesAnio: `${nombreMes} - ${periodo.anio}`,
    razonSocial: mayus(trabajador.empresa.razonsocial),
    ruc: trabajador.empresa.ruc ?? '',
    domicilio: mayus(trabajador.empresa.direccion),
    trabajador: mayus(trabajador.nombrecompleto),
    etiquetaDocumento: mayus(trabajador.tipodocumento) || 'DOCUMENTO',
    documento: trabajador.nrodocumento ?? '',
    cargoArea: [trabajador.cargo, trabajador.area].filter(Boolean).map(mayus).join(' / '),
    horarioBase: horarioBase(mes.dias),
    filas,
    sinFilas: filas.length === 0,
    totalTexto: `TOTALES DEL MES DE ${nombrePeriodo} (${totales.diaslaborables} DÍAS LABORABLES, ${totales.diaslaborados} LABORADOS)`,
    totalHoras: horasMinutos(totales.minutoslaborados),
    totalExtras: horasMinutos(totales.minutosextras),
    totalTardanza: String(totales.minutostardanza),
    feriados: feriados.length
      ? feriados.map((d) => `${fechaCorta(d.fecha)} ${d.nombreferiado ?? ''}`.trim()).join('; ')
      : 'Ninguno',
    hayAjustes: dias.some((d) => d.salidacalculada),
    generado,
  };
}

/** asistencia-2026-11-apellidos-nombres.pdf */
export function nombreArchivoAsistencia(mes: AsistenciaMes, extension: 'pdf' | 'xlsx'): string {
  const persona = mes.trabajador.nombrecompleto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `asistencia-${mes.periodo.anio}-${String(mes.periodo.mes).padStart(2, '0')}-${persona}.${extension}`;
}
