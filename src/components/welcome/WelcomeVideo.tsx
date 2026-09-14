"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Shown once, the first time the site's own PIN gate is ever passed - see
 * LoginForm.tsx, which redirects here instead of straight to `next` when
 * `localStorage["welcomeVideoSeen"]` isn't set yet.
 *
 * Marked as seen on mount rather than on completion, on purpose: if the tab
 * closes mid-video for any reason, better that it doesn't replay next login
 * than that it gets stuck replaying forever.
 *
 * Testing this doesn't touch the real one-time trigger - it lives in
 * *this browser's* storage, not anywhere shared. An incognito window (or
 * clearing site data) gives a completely fresh "first login" to test
 * against, with zero effect on what she'll actually see.
 */
export function WelcomeVideo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem("welcomeVideoSeen", "1");
    } catch {
      // private-browsing storage can throw - not worth blocking the video over
    }
    // The `autoPlay` attribute alone doesn't reliably start playback in
    // every environment - calling .play() explicitly is the more robust
    // pattern. If even muted autoplay gets rejected, she can still start it
    // with the native controls; nothing here needs to block on the promise.
    videoRef.current?.play().catch(() => {});
  }, []);

  function goToNext() {
    router.replace(searchParams.get("next") || "/");
  }

  function unmute() {
    setMuted(false);
    if (videoRef.current) videoRef.current.muted = false;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forest px-4">
      <div className="relative w-full max-w-md">
        <video
          ref={videoRef}
          src="/welcome-video.mp4"
          autoPlay
          muted={muted}
          playsInline
          controls
          onEnded={goToNext}
          className="w-full rounded-2xl bg-black"
        />
        {/* Browsers block autoplay-with-sound outright, so it always starts
            muted - this is the one-tap way to turn sound on, not optional
            chrome. Disappears once tapped since the native controls' own
            mute toggle takes over from there. */}
        {muted && (
          <button
            type="button"
            onClick={unmute}
            className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-paper"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M4 9v6h4l5 5V4L8 9H4Z" />
              <path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
            Ήχος
          </button>
        )}
      </div>

      <button type="button" onClick={goToNext} className="mt-6 text-xs text-paper/60 underline">
        Παράλειψη
      </button>
    </div>
  );
}
