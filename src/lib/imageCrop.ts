/** A crop box in fractions of the image, so it survives any display scale. */
export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const FULL_CROP: CropBox = { x: 0, y: 0, width: 1, height: 1 };

/**
 * Crops a file to the given box and returns base64 JPEG.
 *
 * Cropping before upload is the single biggest fidelity lever in the whole
 * pipeline: when the trim fills the frame the model can actually read it,
 * instead of inventing something plausible from a border occupying 5% of a
 * full-garment photo.
 *
 * JPEG, not PNG — a 2048px PNG photo is 8-12MB of base64 and stage 2 sends two
 * of them. PNG only matters for the model's output, not its input.
 */
export async function cropToBase64(
  file: File,
  box: CropBox = FULL_CROP,
  maxSize = 1600,
): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const sx = Math.round(box.x * bitmap.width);
  const sy = Math.round(box.y * bitmap.height);
  const sw = Math.max(1, Math.round(box.width * bitmap.width));
  const sh = Math.max(1, Math.round(box.height * bitmap.height));

  /* Upscale small crops a little: a 200px cutout gives the model too little. */
  const scale = Math.min(maxSize / Math.max(sw, sh), 2);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");

  /* JPEG has no alpha; without this a transparent source renders black. */
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
}
