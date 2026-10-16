/**
 * Traduce fragmentos en inglés que devuelve la API de Autodesk en detalles de error.
 */
export function translateAutodeskApiEnglishFragment(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let out = text.trim();

  const rules: [RegExp, string][] = [
    [
      /File with extension ([a-zA-Z0-9]+) is not allowed to upload\.?/gi,
      'No se permite subir archivos con la extensión .$1.',
    ],
    [
      /File with extension '([^']+)' is not allowed to upload\.?/gi,
      'No se permite subir archivos con la extensión .$1.',
    ],
    [/Invalid file type\.?/gi, 'Tipo de archivo no válido.'],
    [/Request entity too large\.?/gi, 'El archivo es demasiado grande.'],
    [/Payload Too Large/gi, 'El archivo es demasiado grande.'],
    [
      /File size exceeds (?:the )?maximum allowed\.?/gi,
      'El tamaño del archivo supera el máximo permitido.',
    ],
  ];

  for (const [re, replacement] of rules) {
    out = out.replace(re, replacement);
  }

  return out;
}
