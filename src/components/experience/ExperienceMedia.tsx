"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ExperienceMediaProps = {
  kind: "video" | "image";
  src: string;
  poster: string;
  alt: string;
};

export function ExperienceMedia({ kind, src, poster, alt }: ExperienceMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (kind !== "video" || reduceMotion) return;

    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      video.muted = true;
      void video.play().catch(() => {
        // The poster stays visible if a browser temporarily blocks autoplay.
      });
    };

    playVideo();
    video.addEventListener("loadeddata", playVideo);
    video.addEventListener("canplay", playVideo);

    const resumeWhenVisible = () => {
      if (document.visibilityState === "visible") playVideo();
    };
    document.addEventListener("visibilitychange", resumeWhenVisible);

    return () => {
      video.removeEventListener("loadeddata", playVideo);
      video.removeEventListener("canplay", playVideo);
      document.removeEventListener("visibilitychange", resumeWhenVisible);
    };
  }, [kind, reduceMotion, src]);

  if (kind === "image" || reduceMotion) {
    return (
      <Image
        className="experience-hero-media"
        src={kind === "image" ? src : poster}
        alt={alt}
        fill
        sizes="100vw"
        priority
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className="experience-hero-media"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      aria-label={alt}
      disablePictureInPicture
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
