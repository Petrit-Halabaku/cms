"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { WindowFrame } from "@/components/pages/WindowFrame";

/**
 * Autoplaying clip in the shared window frame. No native controls, no PiP and
 * no download menu — `sound` adds the single affordance worth keeping, since a
 * clip must start muted for autoplay to be allowed at all and unmuting needs a
 * user gesture anyway.
 */
export function FilmFrame({
  src,
  aspectClassName = "aspect-[9/16]",
  ariaLabel,
  className = "",
  sound = false,
  soundLabels = { unmute: "Unmute video", mute: "Mute video" },
}: {
  src: string;
  /** Intrinsic ratio of the source file — reserves the box before metadata loads. */
  aspectClassName?: string;
  ariaLabel: string;
  className?: string;
  sound?: boolean;
  soundLabels?: { unmute: string; mute: string };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // React never serialises `muted` into the SSR markup, so the element reaches
  // the browser unmuted and autoplay is refused. Set it on the DOM node and
  // start playback once, after hydration.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <WindowFrame aspectClassName={aspectClassName} className={className}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        preload="metadata"
        aria-label={ariaLabel}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>

      {sound && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? soundLabels.unmute : soundLabels.mute}
          className="absolute right-3 bottom-3 z-40 rounded-full bg-white/15 p-2 text-white backdrop-blur transition-colors hover:bg-white/30"
        >
          {muted ? (
            <VolumeX className="h-4 w-4" aria-hidden />
          ) : (
            <Volume2 className="h-4 w-4" aria-hidden />
          )}
        </button>
      )}
    </WindowFrame>
  );
}
