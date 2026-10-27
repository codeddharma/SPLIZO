"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Dev builds (Turbopack) often reuse the same chunk URL across rebuilds
    // with different content, which a cache-first service worker serves
    // stale forever — showing up as broken/stale layouts that only clear on
    // a manual unregister. Only register in production, where chunk URLs
    // are content-hashed and this isn't a problem; in dev, actively clean up
    // any worker + cache left over from before this guard existed so it
    // self-heals instead of requiring everyone to clear it by hand.
    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js");
      return;
    }

    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) reg.unregister();
    });
    if ("caches" in window) {
      caches.keys().then((keys) => {
        for (const key of keys) caches.delete(key);
      });
    }
  }, []);

  return null;
}
