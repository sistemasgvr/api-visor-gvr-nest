/**
 * Información extraída de la firma de un comentario
 */
export interface FirmaInfo {
  nombre: string | null;
  rol: string | null;
}

/**
 * Helpers para procesamiento de texto en PDFs
 */
export class PdfTextHelper {
  /**
   * Procesa el texto de un comentario eliminando la firma GVR completa
   * (todo lo que está entre <---FIRMA_GVR---> y <---FIN_FIRMA_GVR--->)
   * y devuelve solo el texto del comentario limpio
   */
  static procesarTextoComentario(texto: string): string {
    if (!texto) return '';

    // Eliminar todo el bloque de firma GVR (incluyendo el contenido entre los marcadores)
    // Formato: texto del comentario <---FIRMA_GVR---> Nombre: ... Rol: ... <---FIN_FIRMA_GVR--->
    texto = texto.replace(
      /<---?FIRMA_GVR---?>[\s\S]*?<---?FIN_FIRMA_GVR---?>/gi,
      '',
    );

    // También manejar el formato sin los < >
    texto = texto.replace(
      /---?FIRMA_GVR---?[\s\S]*?---?FIN_FIRMA_GVR---?/gi,
      '',
    );

    // También manejar el formato con <> pero sin --- en FIN
    texto = texto.replace(/<>[\s\S]*?<>/gi, '');

    // Limpiar espacios múltiples y trim
    texto = texto.replace(/\s+/g, ' ').trim();

    return texto;
  }

  /**
   * Extrae la información de la firma de un comentario
   * Devuelve el nombre y rol del usuario que firmó
   */
  static extraerFirmaInfo(texto: string): FirmaInfo {
    const result: FirmaInfo = {
      nombre: null,
      rol: null,
    };

    if (!texto) return result;

    // Buscar el bloque de firma
    const firmaMatch = texto.match(
      /<---?FIRMA_GVR---?>([\s\S]*?)<---?FIN_FIRMA_GVR---?>/i,
    );

    if (!firmaMatch) {
      // Intentar con formato sin < >
      const firmaMatch2 = texto.match(
        /---?FIRMA_GVR---?([\s\S]*?)---?FIN_FIRMA_GVR---?/i,
      );
      if (firmaMatch2) {
        const contenidoFirma = firmaMatch2[1];
        return this.parsearContenidoFirma(contenidoFirma);
      }
      return result;
    }

    const contenidoFirma = firmaMatch[1];
    return this.parsearContenidoFirma(contenidoFirma);
  }

  /**
   * Parsea el contenido de la firma para extraer nombre y rol
   */
  private static parsearContenidoFirma(contenido: string): FirmaInfo {
    const result: FirmaInfo = {
      nombre: null,
      rol: null,
    };

    if (!contenido) return result;

    // Buscar Nombre: ...
    const nombreMatch = contenido.match(/Nombre:\s*([^R\n]+?)(?:\s*Rol:|$)/i);
    if (nombreMatch && nombreMatch[1]) {
      result.nombre = nombreMatch[1].trim();
    }

    // Buscar Rol: ...
    const rolMatch = contenido.match(/Rol:\s*(.+?)(?:\s*$|\s*<)/i);
    if (rolMatch && rolMatch[1]) {
      result.rol = rolMatch[1].trim();
    }

    return result;
  }
}
