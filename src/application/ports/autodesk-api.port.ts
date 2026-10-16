import type { AutodeskAdminPort } from './autodesk/admin.port';
import type { AutodeskAuthPort } from './autodesk/auth.port';
import type { AutodeskBim360Port } from './autodesk/bim360.port';
import type { AutodeskCompatibilityPort } from './autodesk/compatibility.port';
import type { AutodeskDataManagementPort } from './autodesk/data-management.port';
import type { AutodeskIssuesPort } from './autodesk/issues.port';
import type { AutodeskReviewsPort } from './autodesk/reviews.port';
export type {
  Token2LeggedResponse,
  Token3LeggedResponse,
} from './autodesk/autodesk.types';

/** Contrato agregado de la fachada de compatibilidad; los casos de uso consumen contratos por capacidad. */
export interface AutodeskApiPort
  extends
    AutodeskAuthPort,
    AutodeskDataManagementPort,
    AutodeskBim360Port,
    AutodeskAdminPort,
    AutodeskIssuesPort,
    AutodeskReviewsPort,
    AutodeskCompatibilityPort {}
