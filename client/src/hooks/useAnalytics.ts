import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useRef } from "react";

// Generate or retrieve a session ID for anonymous tracking
function getSessionId(): string {
  const key = "clubs_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function useAnalytics() {
  const trackMutation = trpc.analytics.track.useMutation();
  const sessionId = useRef<string>("");

  useEffect(() => {
    sessionId.current = getSessionId();
  }, []);

  const trackPageView = useCallback(
    (path: string, clubId?: number) => {
      trackMutation.mutate({
        eventType: "page_view",
        path,
        clubId,
        sessionId: sessionId.current,
      });
    },
    [trackMutation]
  );

  const trackOutboundClick = useCallback(
    (target: "instagram" | "whatsapp" | "website", clubId?: number) => {
      trackMutation.mutate({
        eventType: "outbound_click",
        target,
        clubId,
        sessionId: sessionId.current,
      });
    },
    [trackMutation]
  );

  const trackSearch = useCallback(
    (query: string) => {
      trackMutation.mutate({
        eventType: "search",
        path: query,
        sessionId: sessionId.current,
      });
    },
    [trackMutation]
  );

  return { trackPageView, trackOutboundClick, trackSearch };
}
