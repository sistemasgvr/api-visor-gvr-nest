import { randomBytes } from 'crypto';
import type { MailTransportAttachment } from '../../domain/services/mail-transport.interface';

export interface ResolvedMailHtmlWithAttachments {
  html: string;
  attachments: MailTransportAttachment[];
}

const DATA_URI_PATTERN =
  /data:image\/([a-zA-Z0-9+.-]+);base64,([a-zA-Z0-9+/=\r\n]+)/g;

function buildCid(index: number): string {
  return `mail-img-${index}-${randomBytes(4).toString('hex')}@gvr`;
}

function extensionForMime(mime: string): string {
  if (mime.includes('png')) return 'png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('webp')) return 'webp';
  return 'bin';
}

/**
 * Gmail y otros clientes bloquean src="data:image/...;base64,...".
 * Convierte cada data URI a adjunto inline (CID) referenciado en el HTML.
 */
export function resolveMailHtmlInlineDataUris(
  html: string,
): ResolvedMailHtmlWithAttachments {
  const attachments: MailTransportAttachment[] = [];
  const cache = new Map<string, string>();
  let index = 0;

  const resolvedHtml = html.replace(
    DATA_URI_PATTERN,
    (dataUri, mimeSubtype: string, base64Payload: string) => {
      let cid = cache.get(dataUri);
      if (!cid) {
        cid = buildCid(index++);
        cache.set(dataUri, cid);
        attachments.push({
          filename: `inline-${index}.${extensionForMime(`image/${mimeSubtype}`)}`,
          content: Buffer.from(base64Payload.replace(/\s+/g, ''), 'base64'),
          contentType: `image/${mimeSubtype}`,
          cid,
        });
      }
      return `cid:${cid}`;
    },
  );

  return { html: resolvedHtml, attachments };
}
