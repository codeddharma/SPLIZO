"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const THEMES = ["system", "light", "dark"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button variant="outline" size="icon" aria-label="Toggle theme" />;
  }

  const current = THEMES.includes(theme as (typeof THEMES)[number])
    ? (theme as (typeof THEMES)[number])
    : "system";
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];

  const icon = { system: "🖥️", light: "☀️", dark: "🌙" }[current];

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={`Theme: ${current}. Click to switch to ${next}.`}
      onClick={() => setTheme(next)}
    >
      <span aria-hidden="true">{icon}</span>
    </Button>
  );
}
