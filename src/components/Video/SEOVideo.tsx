"use client";
import { useEffect, useRef, useState } from "react";

interface SEOVideoProps {
  src: string;
  poster?: string;

  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;

  pauseOnScroll?: boolean;
  threshold?: number;
  onReady?: () => void;
}

const SEOVideo: React.FC<SEOVideoProps> = ({
  src,
  poster,

  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,

  pauseOnScroll = true,
  threshold = 0.35,
  onReady,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  /* ---------------- Intersection Observer ---------------- */
  useEffect(() => {
    if (!pauseOnScroll) return; // ✅ no state update

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.intersectionRatio >= threshold);
      },
      { threshold: [0, threshold, 0.6] }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [pauseOnScroll, threshold]);

  /* ---------------- Play / Pause + Unload ---------------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const shouldPlay = pauseOnScroll ? isVisible : true;

    if (shouldPlay && autoPlay) {
      if (!video.src) {
        video.src = src;
        video.load();
      }
      video.play().catch(() => {});
    } else {
      video.pause();
      if (video.src) {
        video.removeAttribute("src");
        video.load();
      }
    }
  }, [isVisible, pauseOnScroll, autoPlay, src]);
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <video
        ref={videoRef}
        poster={poster}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
        preload="metadata"
        controlsList="nodownload"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
};

export default SEOVideo;
