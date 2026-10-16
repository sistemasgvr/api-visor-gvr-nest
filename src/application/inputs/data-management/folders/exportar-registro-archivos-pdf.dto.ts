export class ExportarRegistroArchivosPdfDto {
  titulo: string;

  /** true = carpeta actual y subcarpetas; false = solo carpeta actual */

  incluirSubcarpetas: boolean;

  /** Incluir columna de atributos personalizados (extension.data) */

  incluirAtributosPersonalizados: boolean;

  /** Hub ACC (mismo id de ruta) para resolver el nombre del proyecto al exportar */

  hubId?: string;
}
