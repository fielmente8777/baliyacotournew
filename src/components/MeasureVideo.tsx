'use client';

import { videoSource } from '@/lib/videoEmbed';
import { cn } from '@/lib/format';

/** Plays the admin's "How to measure" video link, whatever kind of link it is. */
export default function MeasureVideo({ url, autoPlay, className }: { url: string; autoPlay?: boolean; className?: string }) {
  const source = videoSource(url);
  if (!source) return null;

  if (source.kind === 'file') {
    return (
      <video
        src={source.src}
        controls
        playsInline
        autoPlay={autoPlay}
        preload="metadata"
        className={cn('aspect-video w-full bg-black', className)}
      />
    );
  }

  const src = autoPlay ? `${source.src}${source.src.includes('?') ? '&' : '?'}autoplay=1` : source.src;
  return (
    <iframe
      src={src}
      title="How to measure"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      className={cn(
        'w-full bg-black',
        source.portrait ? 'mx-auto aspect-[9/16] max-h-[70vh] w-auto' : 'aspect-video',
        className
      )}
    />
  );
}
