"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { useMousePosition, useIsMobile, usePrefersReducedMotion } from "@/app/hooks/useMousePosition";

export function CustomCursor() {
  const mousePosition = useMousePosition();
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const [isHovering, setIsHovering] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { stiffness: 500, damping: 28 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const scale = useTransform(
    useMotionValue(0),
    [0, 1],
    [1, isHovering ? 3 : 1]
  );

  useEffect(() => {
    if (isMobile || reducedMotion) return;

    cursorX.set(mousePosition.x);
    cursorY.set(mousePosition.y);
  }, [mousePosition.x, mousePosition.y, cursorX, cursorY, isMobile, reducedMotion]);

  useEffect(() => {
    if (isMobile || reducedMotion) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        !!target.closest("button") ||
        !!target.closest("a") ||
        target.role === "button" ||
        target.getAttribute("data-cursor-pointer") !== null;

      setIsHovering(!!isInteractive);
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, [isMobile, reducedMotion]);

  if (isMobile || reducedMotion) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[9999] mix-blend-difference"
      style={{
        backgroundColor: "#d4af37",
        x: cursorXSpring,
        y: cursorYSpring,
        scale,
        translateX: "-50%",
        translateY: "-50%",
      }}
      aria-hidden="true"
    />
  );
}
