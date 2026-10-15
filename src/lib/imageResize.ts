/**
 * Reads an image file, scales it down, and returns base64 (no data: prefix).
 *
 * JPEG at quality 0.92 by default. PNG was used before to protect fine
 * embroidery detail, but a 2048px PNG phone photo is ~4 MB — five of them
 * came to 20 MB, and Next.js cuts any request through its proxy at 10 MB,
 * so the upload arrived half-empty. At 0.92 thread, bead and zari edges are
 * visually unchanged, at ~0.5–1 MB per photo. The backend re-encodes to PNG
 * before sending to OpenAI anyway.
 */
export async function fileToResizedBase64(
  file: File,
  maxSize = 2048,
  options: { format?: 'image/jpeg' | 'image/png' | 'image/webp'; quality?: number } = {},
): Promise<string> {
  const { format = 'image/jpeg', quality = 0.92 } = options;
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable');

  /* JPEG has no transparency — paint white first so transparent PNGs don't
     turn black. */
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  return canvas.toDataURL(format, quality).split(',')[1];
}

/** Decoded size of a base64 string, in bytes. */
export const base64Bytes = (base64: string) => Math.floor((base64.length * 3) / 4);

/**
 * Next.js cuts request bodies at 10 MB (proxyClientMaxBodySize). Keep a
 * margin for the JSON around the images.
 */
export const MAX_UPLOAD_BYTES = 9 * 1024 * 1024;
