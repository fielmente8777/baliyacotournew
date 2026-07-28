"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

const SEOVideo = dynamic(() => import("./SEOVideo"), {
  ssr: false,
});

interface LazyLoadedVideoProps {
  src: string;
  poster?: string;
}

export default function LazyLoadedVideo({
  src,
  poster,
}: LazyLoadedVideoProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && poster && (
        <Image
          src={poster}
          alt="Video Poster"
          fill
          className="object-cover"
        />
      )}

      <SEOVideo
        src={src}
        poster={poster}
        onReady={() => setLoaded(true)}
      />
    </>
  );
}