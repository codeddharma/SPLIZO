"use client";

import { useLayoutEffect, useState } from "react";

const STORAGE_KEY = "splizo:sidebar-collapsed";

export function useSidebarCollapsed() {
  // Always start matching the server-rendered (expanded) markup, then
  // correct synchronously before paint — avoids a hydration mismatch from
  // reading the DOM attribute the no-flash inline script already set.
  const [collapsed, setCollapsed] = useState(false);

  useLayoutEffect(() => {
    if (document.documentElement.getAttribute("data-sidebar-collapsed") === "true") {
      setCollapsed(true);
    }
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // localStorage unavailable (private mode, etc.) — collapse still works for this session
      }
      if (next) {
        document.documentElement.style.setProperty("--sidebar-w", "4rem");
        document.documentElement.setAttribute("data-sidebar-collapsed", "true");
      } else {
        document.documentElement.style.removeProperty("--sidebar-w");
        document.documentElement.removeAttribute("data-sidebar-collapsed");
      }
      return next;
    });
  }

  return { collapsed, toggle };
}
