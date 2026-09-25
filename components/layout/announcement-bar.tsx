"use client";

import { useEffect, useState } from "react";

/** Rotating announcement lines. Text comes from Shopify (`announcement` metaobject). */
export function AnnouncementBar({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), 5000);
    return () => window.clearInterval(id);
  }, [messages.length]);

  if (!messages.length) return null;

  return (
    <div className="bg-charcoal text-alabaster dark:bg-[#0c0b0b]">
      <div className="container-wa relative flex h-9 items-center justify-center overflow-hidden">
        {messages.map((m, i) => (
          <p
            key={m}
            aria-hidden={i !== index}
            className="absolute inset-x-4 truncate text-center font-display text-[9px] font-medium tracking-[0.14em] uppercase sm:tracking-[0.2em] transition-all duration-500 ease-(--ease-luxe) sm:text-[10.5px]"
            style={{
              opacity: i === index ? 1 : 0,
              transform: `translateY(${i === index ? 0 : i < index ? -8 : 8}px)`,
            }}
          >
            {m}
          </p>
        ))}
      </div>
    </div>
  );
}
