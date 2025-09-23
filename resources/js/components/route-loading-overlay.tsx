import { router } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function RouteLoadingOverlay() {
  const [isNavigating, setIsNavigating] = useState(false);
  // Mount state for overlay and visual opacity state for transitions
  const [isShown, setIsShown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearShowTimer = () => {
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };

    const clearHideTimer = () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const onStart = (event: any) => {
      clearShowTimer();
      clearHideTimer();
      // Only show when the next visit changes the pathname (i.e., real page switch)
      try {
        const nextUrl = new URL(event?.detail?.visit?.url || "", window.location.origin);
        const isPageChange = nextUrl.pathname && nextUrl.pathname !== window.location.pathname;
        if (!isPageChange) {
          return;
        }
      } catch {
        // If parsing fails, fallback to not showing to avoid random flashes
        return;
      }
      // Wait a bit; only show overlay if the NProgress bar actually appears
      showTimerRef.current = window.setTimeout(() => {
        const nprogressEl = document.getElementById("nprogress");
        if (nprogressEl) {
          setIsNavigating(true);
          // Mount overlay and then fade in
          setIsShown(true);
          requestAnimationFrame(() => setIsVisible(true));
        }
      }, 250); // match/default NProgress delay feel
    };

    const onStop = () => {
      clearShowTimer();
      setIsNavigating(false);
      // Fade out, then unmount after transition
      setIsVisible(false);
      clearHideTimer();
      hideTimerRef.current = window.setTimeout(() => {
        setIsShown(false);
      }, 200); // keep in sync with CSS duration
    };

    const offStart = router.on("start", onStart);
    const offFinish = router.on("finish", onStop);
    const offError = router.on("error", onStop);
    const offInvalid = router.on("invalid", onStop);

    return () => {
      clearShowTimer();
      clearHideTimer();
      offStart?.();
      offFinish?.();
      offError?.();
      offInvalid?.();
    };
  }, []);

  if (!isShown) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 transition-opacity duration-200 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-3 rounded-md p-6">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="text-sm text-white/90">Loading...</span>
      </div>
    </div>,
    document.body,
  );
}
