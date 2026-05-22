/**
 * Orígenes permitidos para CORS: lista explícita + variantes con/sin www.
 */
export function buildCorsAllowedOrigins(urls: string[]): string[] {
  const set = new Set<string>();

  for (const raw of urls) {
    const base = raw.trim().replace(/\/$/, '');
    if (!base) continue;
    set.add(base);

    try {
      const parsed = new URL(base);
      const host = parsed.hostname;
      const port = parsed.port ? `:${parsed.port}` : '';
      const proto = parsed.protocol;

      if (host.startsWith('www.')) {
        set.add(`${proto}//${host.slice(4)}${port}`);
      } else if (!host.includes('localhost') && host.includes('.')) {
        set.add(`${proto}//www.${host}${port}`);
      }
    } catch {
      // URL inválida: solo se usa el valor literal
    }
  }

  return [...set];
}

export function isOriginAllowed(
  origin: string | undefined,
  allowedOrigins: string[],
): boolean {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  return allowedOrigins.some(
    (o) => origin === o || normalized === o.replace(/\/$/, ''),
  );
}
