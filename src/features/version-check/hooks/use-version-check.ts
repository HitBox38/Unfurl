import { useCallback, useEffect, useRef, useState } from "react";

import { fetchLatestVersion, type VersionResult } from "../api";
import { CHECK_INTERVAL_MS, CHECK_TIMEOUT_MS } from "../constants";

export function useVersionCheck(desktop: boolean) {
  const [result, setResult] = useState<VersionResult | null>(null);
  const [status, setStatus] = useState<"idle" | "checking" | "checked" | "error">("idle");
  const lastCheck = useRef<number | null>(null);
  const request = useRef<AbortController | null>(null);

  const check = useCallback(async (manual = false) => {
    if (
      request.current ||
      (!manual && lastCheck.current !== null && Date.now() - lastCheck.current < CHECK_INTERVAL_MS)
    ) return;
    const controller = new AbortController();
    request.current = controller;
    lastCheck.current = Date.now();
    setStatus("checking");
    const timeout = window.setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    try {
      const latest = await fetchLatestVersion(desktop, controller.signal);
      if (request.current !== controller) return;
      setResult(latest);
      setStatus("checked");
    } catch {
      if (request.current === controller) setStatus("error");
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) request.current = null;
    }
  }, [desktop]);

  useEffect(() => {
    const autoCheck = () => {
      if (!import.meta.env.DEV && document.visibilityState === "visible") void check();
    };
    const startup = window.setTimeout(autoCheck, 0);
    const interval = window.setInterval(autoCheck, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", autoCheck);
    window.addEventListener("focus", autoCheck);
    window.addEventListener("online", autoCheck);
    return () => {
      window.clearTimeout(startup);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", autoCheck);
      window.removeEventListener("focus", autoCheck);
      window.removeEventListener("online", autoCheck);
      const active = request.current;
      request.current = null;
      active?.abort();
      lastCheck.current = null;
    };
  }, [check]);

  return { desktop, result, status, check };
}
