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
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("welcomeVideoSeen", "1");
    } catch {
      // private-browsing storage can throw - not worth blocking the video over
    }
  }, []);

  function goToNext() {
    router.replace(searchParams.get("next") || "/");
  }

  function play() {
    setStarted(true);
    videoRef.current?.play();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forest px-4">
      <div className="relative w-full max-w-md">
        <video
          ref={videoRef}
          src="/welcome-video.mp4"
          playsInline
          controls={started}
          onEnded={() => setEnded(true)}
          className="w-full rounded-2xl bg-black"
        />
        {!started && (
          <button
            type="button"
            onClick={play}
            aria-label="Αναπαραγωγή"
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 transition-colors hover:bg-black/40"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper/90 text-clay">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor">
                <path d="M8 5v14l11-7Z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {ended ? (
        <button
          type="button"
          onClick={goToNext}
          className="mt-6 rounded-xl bg-terracotta px-5 py-2.5 text-sm font-medium text-paper"
        >
          Συνέχεια
        </button>
      ) : (
        <button type="button" onClick={goToNext} className="mt-6 text-xs text-paper/60 underline">
          Παράλειψη
        </button>
      )}
    </div>
  );
}
