/**
 * Turns whatever video link the admin pastes into something playable:
 * YouTube (watch, youtu.be, shorts), Vimeo and Google Drive links become an
 * embed URL for an <iframe>; anything else is played as a file in <video>.
 */

export type VideoSource =
  | { kind: 'iframe'; src: string; portrait: boolean }
  | { kind: 'file'; src: string };

export function videoSource(url: string): VideoSource | null {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, '');

  if (host === 'youtu.be' || host.endsWith('youtube.com')) {
    const shorts = u.pathname.match(/^\/shorts\/([\w-]{6,})/);
    const id =
      host === 'youtu.be'
        ? u.pathname.slice(1).split('/')[0]
        : (shorts?.[1] ?? u.searchParams.get('v') ?? u.pathname.match(/^\/(?:embed|live)\/([\w-]{6,})/)?.[1]);
    if (id) {
      return {
        kind: 'iframe',
        src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`,
        portrait: Boolean(shorts),
      };
    }
  }

  if (host.endsWith('vimeo.com')) {
    const id = u.pathname.match(/(\d{6,})/)?.[1];
    if (id) return { kind: 'iframe', src: `https://player.vimeo.com/video/${id}`, portrait: false };
  }

  if (host === 'drive.google.com') {
    const id = u.pathname.match(/\/file\/d\/([\w-]+)/)?.[1] ?? u.searchParams.get('id');
    if (id) return { kind: 'iframe', src: `https://drive.google.com/file/d/${id}/preview`, portrait: false };
  }

  return { kind: 'file', src: u.toString() };
}
