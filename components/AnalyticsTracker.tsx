"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getOrCreateSessionId(): string {
  try {
    let id = sessionStorage.getItem("mimi_sid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("mimi_sid", id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const sessionId = getOrCreateSessionId();
    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        sessionId,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
