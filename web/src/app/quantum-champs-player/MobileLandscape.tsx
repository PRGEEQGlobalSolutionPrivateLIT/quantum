"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export default function MobileLandscape({
  children,
}: {
  children: ReactNode;
}) {
  const attempted = useRef(false);

  useEffect(() => {
    const requestLandscape = async () => {
      if (attempted.current) return;

      const mobile = window.matchMedia(
        "(max-width: 900px) and (orientation: portrait)"
      ).matches;

      if (!mobile) return;

      attempted.current = true;

      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }

        await screen.orientation.lock("landscape");
      } catch (error) {
        attempted.current = false;
        console.warn("Landscape orientation not supported:", error);
      }
    };

    const handleTap = () => {
      void requestLandscape();
    };

    document.addEventListener("click", handleTap);

    return () => {
      document.removeEventListener("click", handleTap);
    };
  }, []);

  return <>{children}</>;
}