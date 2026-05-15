import React from "react";

export default function Waveform({ active = true, color = "#2A9D8F" }) {
  if (!active) return null;
  return (
    <div className="flex items-center justify-center gap-1 h-10">
      {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
        <span
          key={i}
          className="wave-bar"
          style={{
            background: color,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}
