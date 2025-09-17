import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function ConfettiBurst({
  onDone,
  duration = 1000,
  count = 150,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");

    // HiDPI-safe sizing
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // Draw using CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#90bb63", "#ad7671", "#e4dac8", "#fbfaf8"];
    const parts = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 40,
      vx: -2 + Math.random() * 4,
      vy: 3 + Math.random() * 3,
      s: 4 + Math.random() * 6,
      c: colors[(Math.random() * colors.length) | 0],
      r: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
    }));

    let raf = 0;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      // clear in CSS pixel space thanks to setTransform
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
        ctx.restore();
      }
      if (elapsed >= duration) {
        cancelAnimationFrame(raf);
        onDone?.();
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [onDone, duration, count]);

  // Render above everything via a portal
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        pointerEvents: "none",
      }}
    >
      <canvas ref={ref} />
    </div>,
    document.body
  );
}
