"use client";

import { useEffect, useState } from "react";

interface Star {
  id: number;
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
}

interface FloatingElement {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  horizontalDrift: number;
}

const STAR_COUNT = 200;
const FLOATING_ELEMENT_COUNT = 30;

export function AnimatedBackground() {
  const [stars, setStars] = useState<Star[]>([]);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    // Generate twinkling stars scattered across the viewport
    const newStars = Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1, // 1px to 4px - small twinkling stars
      left: Math.random() * 100, // 0% to 100% - random position
      top: Math.random() * 100, // 0% to 100% - random position
      duration: Math.random() * 3 + 2, // 2s to 5s - twinkling duration
      delay: Math.random() * 5, // 0s to 5s - staggered twinkling
    }));

    // Generate floating elements that drift upward like space debris
    const newFloatingElements = Array.from({ length: FLOATING_ELEMENT_COUNT }, (_, i) => ({
      id: i,
      size: Math.random() * 20 + 10, // 10px to 30px - larger floating elements
      left: Math.random() * 100, // 0% to 100% - random starting position
      duration: Math.random() * 20 + 30, // 30s to 50s - slow floating motion
      delay: -(Math.random() * 50), // Negative delay for staggered start
      horizontalDrift: (Math.random() - 0.5) * 30, // -15vw to +15vw - horizontal drift
    }));

    setStars(newStars);
    setFloatingElements(newFloatingElements);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Twinkling Stars */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="absolute rounded-full animate-twinkle bg-primary/80"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      
      {/* Floating Elements */}
      {floatingElements.map((element) => (
        <div
          key={`element-${element.id}`}
          className="absolute rounded-full animate-cosmic-float border border-accent/20"
          style={
            {
              width: `${element.size}px`,
              height: `${element.size}px`,
              left: `${element.left}%`,
              bottom: `-${element.size}px`,
              backgroundColor: "transparent",
              animationDuration: `${element.duration}s`,
              animationDelay: `${element.delay}s`,
              "--horizontal-drift": `${element.horizontalDrift}vw`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
