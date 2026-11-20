import { types } from 'pg';
import { APP_TIME_ZONE, parseLimaDate } from '../domain/utils/lima-date.util';

// Se ejecuta antes de crear conexiones, workers o servicios. TZ no modifica Date.now().
process.env.TZ = APP_TIME_ZONE;

// pg interpreta TIMESTAMP sin zona usando TZ del proceso. Hacemos explícito el
// contrato de la BD (hora civil de Lima), incluso si otro módulo cambia TZ.
types.setTypeParser(types.builtins.TIMESTAMP, value => parseLimaDate(value));
types.setTypeParser(types.builtins.DATE, value => parseLimaDate(value));
