/**
 * Downloads a generated image.
 *
 * Fetched into a blob rather than linked with `download`, because the browser
 * ignores that attribute on a cross-origin URL and opens the image instead.
 * Saving the sheet is the whole point of the extract-once-reuse workflow, so
 * it has to actually save.
 */
export async function downloadImage(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not download that image');

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);
}
