import { useEffect, useRef } from "react";

const NUM = 70;

export default function StarField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx    = canvas.getContext("2d");
    let raf;
    const stars  = [];

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function init() {
      resize();
      stars.length = 0;
      for (let i = 0; i < NUM; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.4 + 0.3,
          a: Math.random() * 0.5 + 0.07,
          dx: (Math.random() - 0.5) * 0.11,
          dy: (Math.random() - 0.5) * 0.11,
          ts: Math.random() * 0.007 + 0.003,
          td: Math.random() > 0.5 ? 1 : -1,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.a += s.ts * s.td;
        if (s.a > 0.62 || s.a < 0.04) s.td *= -1;
        s.x = (s.x + s.dx + canvas.width)  % canvas.width;
        s.y = (s.y + s.dy + canvas.height) % canvas.height;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,151,58,${s.a.toFixed(3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas ref={ref}
      style={{ position:"fixed", inset:0, width:"100%", height:"100%",
               pointerEvents:"none", zIndex:0 }} />
  );
}
