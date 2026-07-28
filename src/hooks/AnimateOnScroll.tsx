"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  direction?: "left" | "right" | "bottom";
  className?: string;
  enableDesktop?: boolean;
};

export default function AnimateOnScroll({
  children,
  direction = "bottom",
  className = "",
  enableDesktop = false,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setActive(true);
          obs.unobserve(entry.target); // run once
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`animate animate-${direction} ${
        active ? "active" : ""
      } ${enableDesktop ? "desktop-allowed" : ""} ${className}`}
    >
      {children}
    </div>
  );
}