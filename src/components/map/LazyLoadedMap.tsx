"use client";
// components/LazyLoadedMap.jsx
import dynamic from "next/dynamic";

const LazyLoadedMap = dynamic(() => import("./EmbeddedMap"), {
  ssr: false, // This ensures the component is only rendered on the client side
  loading: () => (
    <p className="text-center font-bold text-3xl text-blue-primary">
      Loading map...
    </p>
  ),
});

export default LazyLoadedMap;
