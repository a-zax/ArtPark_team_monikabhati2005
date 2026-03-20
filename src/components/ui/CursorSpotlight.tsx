"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CursorSpotlight() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setIsVisible(true);
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      setIsHovering(
        window.getComputedStyle(target).cursor === "pointer" || 
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button'
      );
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", updateMousePosition);
    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: mousePosition.x - 16,
            y: mousePosition.y - 16,
            scale: isHovering ? 1.8 : 1,
            backgroundColor: isHovering ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.05)",
            borderColor: isHovering ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.4)"
          }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 28, mass: 0.5 }}
          className="pointer-events-none fixed top-0 left-0 z-[100] w-8 h-8 rounded-full border-2 mix-blend-screen hidden md:block backdrop-blur-[1px]"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
