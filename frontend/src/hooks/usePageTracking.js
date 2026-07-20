import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent, trackScrollDepth, trackSessionEnd } from "../services/analyticsService";

export function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    const page = location.pathname.replace(/^\//, "") || "landing";
    trackEvent("page_view", { page });

    let maxDepth = 0;
    let highestSentThreshold = 0;
    const thresholds = [25, 50, 75, 100];

    const updateDepth = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const depth = documentHeight <= 0 ? 100 : Math.round((window.scrollY / documentHeight) * 100);
      maxDepth = Math.max(maxDepth, Math.min(100, Math.max(0, depth)));
      const crossed = thresholds.findLast((threshold) => maxDepth >= threshold && threshold > highestSentThreshold);
      if (crossed) {
        highestSentThreshold = crossed;
        trackScrollDepth(page, crossed);
      }
    };

    const endSession = () => {
      updateDepth();
      trackSessionEnd(page, maxDepth);
    };

    window.addEventListener("scroll", updateDepth, { passive: true });
    window.addEventListener("pagehide", endSession);

    return () => {
      window.removeEventListener("scroll", updateDepth);
      window.removeEventListener("pagehide", endSession);
      if (maxDepth > 0) trackScrollDepth(page, maxDepth);
    };
  }, [location.pathname]);
}
