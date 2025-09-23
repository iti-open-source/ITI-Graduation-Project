import { router } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function RouteLoadingOverlay() {
  const [isNavigating, setIsNavigating] = useState(false);
  const showTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearShowTimer = () => {
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };

    const onStart = () => {
      clearShowTimer();
      // Wait a bit; only show overlay if the NProgress bar actually appears
      showTimerRef.current = window.setTimeout(() => {
        const nprogressEl = document.getElementById("nprogress");
        if (nprogressEl) {
          setIsNavigating(true);
        }
      }, 250); // match/default NProgress delay feel
    };

    const onStop = () => {
      clearShowTimer();
      setIsNavigating(false);
    };

    const offStart = router.on("start", onStart);
    const offFinish = router.on("finish", onStop);
    const offError = router.on("error", onStop);
    const offInvalid = router.on("invalid", onStop);

    return () => {
      clearShowTimer();
      offStart?.();
      offFinish?.();
      offError?.();
      offInvalid?.();
    };
  }, []);

  if (!isNavigating) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90">
      <div className="flex flex-col items-center gap-3 rounded-md p-6">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="text-sm text-white/90">Loading...</span>
      </div>
    </div>,
    document.body,
  );
}
