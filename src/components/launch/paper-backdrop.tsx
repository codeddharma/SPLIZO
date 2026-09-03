"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Grid-paper ground for the light/dark templates.
 *
 * `quiet` (default) is grid plus one soft glow behind the hero — enough to stop
 * the page going flat, calm enough to sit under content-heavy sections.
 * `full` adds drifting colour washes, a pointer spotlight and a grain overlay,
 * for a page whose background has to carry more of the interest on its own.
 *
 * Every colour is a theme token, so it reads as warm paper in light mode and
 * deep slate in dark without a second set of styles. Everything that moves is
 * transform-only (GPU) and stops entirely under prefers-reduced-motion.
 *
 * Pass `className="fixed inset-0"` on a long scrolling page so the ground
 * covers the whole document rather than the first viewport.
 */
export function PaperBackdrop({
  variant = "quiet",
  className,
}: {
  variant?: "quiet" | "full";
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const full = variant === "full";

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spotX = useSpring(pointerX, { stiffness: 60, damping: 24, mass: 0.6 });
  const spotY = useSpring(pointerY, { stiffness: 60, damping: 24, mass: 0.6 });

  useEffect(() => {
    if (!full || reduceMotion) return;
    // Coarse pointers have no hover, so the spotlight would only ever jump.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (event: PointerEvent) => {
      pointerX.set(event.clientX - window.innerWidth / 2);
      pointerY.set(event.clientY - window.innerHeight / 2);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [full, reduceMotion, pointerX, pointerY]);

  const drift = (x: number[], y: number[], duration: number) =>
    reduceMotion
      ? undefined
      : {
          animate: { x, y },
          transition: { duration, repeat: Infinity, ease: "easeInOut" as const },
        };

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* Grid paper, faded out towards the edges */}
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />

      {/* The one layer that earns its keep: a wide glow anchoring the hero */}
      <div className="absolute top-[-26rem] left-1/2 h-[44rem] w-[64rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

      {full ? (
        <>
          <motion.div
            {...drift([0, 70, 0], [0, 45, 0], 26)}
            className="absolute top-[-14rem] right-[-14rem] h-[40rem] w-[40rem] rounded-full bg-primary/14 blur-[130px]"
          />
          <motion.div
            {...drift([0, -60, 0], [0, 55, 0], 32)}
            className="absolute bottom-[-16rem] left-[-12rem] h-[36rem] w-[36rem] rounded-full bg-income/12 blur-[130px]"
          />
          <motion.div
            {...drift([0, 50, 0], [0, -40, 0], 22)}
            className="absolute top-[38%] left-[35%] h-[30rem] w-[30rem] rounded-full bg-warning/8 blur-[130px]"
          />

          {reduceMotion ? null : (
            <motion.div
              style={{ x: spotX, y: spotY }}
              className="absolute top-1/2 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]"
            />
          )}

          {/* Grain, so the stacked gradients never band */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.035]">
            <filter id="paper-grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.85"
                numOctaves="2"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#paper-grain)" />
          </svg>
        </>
      ) : null}
    </div>
  );
}
