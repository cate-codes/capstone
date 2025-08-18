import { useEffect, useRef } from "react";

export default function ConfettiBurst({ onDone, duration = 900 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const colors = ["#90bb63", "#ad7671", "#e4dac8", "#fbfaf8"];
    const N = 140;

    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * 40,
      vx: -2 + Math.random() * 4,
      vy: 3 + Math.random() * 3,
      s: 4 + Math.random() * 6,
      c: colors[Math.floor(Math.random() * colors.length)],
      r: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
    }));

    let stop = false;

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      if (stop) return;
      ctx.clearRect(0, 0, w, h);
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
      requestAnimationFrame(tick);
    };
    tick();

    const timer = setTimeout(() => {
      stop = true;
      onDone?.();
    }, duration);

    return () => {
      stop = true;
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [onDone, duration]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <canvas ref={ref} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
