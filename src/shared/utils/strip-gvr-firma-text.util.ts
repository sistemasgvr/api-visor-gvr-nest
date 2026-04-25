/**
 * Elimina el bloque de firma GVR añadido a comentarios (p. ej. en CommentsSection.vue)
 * para mostrar solo el cuerpo visible.
 */
export function stripGvrFirmaDelComentario(
  text: string | undefined | null,
): string {
  if (text == null || String(text).length === 0) {
    return '';
  }
  let t = String(text);
  t = t.replace(/<---?FIRMA_GVR---?>[\s\S]*?<---?FIN_FIRMA_GVR---?>/gi, '');
  t = t.replace(/---?FIRMA_GVR---?[\s\S]*?---?FIN_FIRMA_GVR---?/gi, '');
  t = t.replace(/\n{3,}/g, '\n\n').trim();
  return t;
}
