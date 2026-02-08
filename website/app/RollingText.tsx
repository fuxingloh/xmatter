"use client";

import { useEffect, useRef, useState } from "react";

const words = ["npm", "README.md", "Frontmatter", "Metadata", "Icons"];
const items = [...words, words[0]];

export function RollingText() {
  const [pos, setPos] = useState(0);
  const [smooth, setSmooth] = useState(true);
  const widthsRef = useRef<number[]>([]);
  const [width, setWidth] = useState<number>();
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!innerRef.current) return;
    const spans = innerRef.current.querySelectorAll<HTMLElement>("[data-word]");
    widthsRef.current = Array.from(spans)
      .slice(0, words.length)
      .map((el) => el.offsetWidth);
    setWidth(widthsRef.current[0]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = pos + 1;
      setSmooth(true);
      setWidth(widthsRef.current[next % words.length]);
      setPos(next);
    }, 2500);
    return () => clearTimeout(timer);
  }, [pos]);

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== "transform") return;
    if (pos >= words.length) {
      setSmooth(false);
      setPos(0);
    }
  };

  const translateY = -(pos / items.length) * 100;

  return (
    <span
      className="text-mono-950 inline-block h-lh overflow-hidden align-bottom font-semibold"
      style={{
        width: width != null ? `${width}px` : "auto",
        transition: smooth ? "width 500ms cubic-bezier(0.76, 0, 0.24, 1)" : "none",
      }}
    >
      <span
        ref={innerRef}
        className="block"
        style={{
          transform: `translateY(${translateY}%)`,
          transition: smooth ? "transform 500ms cubic-bezier(0.76, 0, 0.24, 1)" : "none",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {items.map((word, i) => (
          <span key={i} data-word className="block w-fit whitespace-nowrap">
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}
