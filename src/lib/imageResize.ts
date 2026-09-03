export async function fileToResizedBase64(
  file: File,
  maxSize = 2048,
): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(
    1,
    maxSize / Math.max(bitmap.width, bitmap.height),
  );

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is unavailable");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    bitmap,
    0,
    0,
    width,
    height,
  );

  /*
   * Keep PNG during the extraction stage.
   *
   * JPEG compression can destroy small embroidery details,
   * metallic edges, beads and fine thread patterns.
   */
  return canvas
    .toDataURL("image/png")
    .split(",")[1];
}