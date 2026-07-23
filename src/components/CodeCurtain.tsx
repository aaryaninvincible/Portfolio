import React, { useEffect, useRef } from 'react';

const SOURCE = `/* ARYAN RAIKWAR // FULL-STACK & AI ARCHITECT */
const portfolio = {
  creator: "Aryan Raikwar",
  role: "AI/ML Engineer & Full Stack Developer",
  motto: "Transforming vision into digital reality with clean code and AI innovation",
  skills: ["React", "TypeScript", "Python", "PyTorch", "Node.js", "Three.js", "Firebase"],
  status: "Building next-generation intelligent applications...",
  quote: "Code is poetry written with logic and rendered with passion."
};
function createMagic(idea) {
  return idea.compile().optimize().ship();
}
console.log("Welcome to my interactive canvas curtain! Move your mouse or touch to interact!");`;

export const CodeCurtain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let resizeTimer: number | NodeJS.Timeout;
    let gustIntervalId: NodeJS.Timeout;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;

    const GRAVITY = 0.28;
    const DAMPING = 0.982;
    const STIFF_V = 0.42;
    const STIFF_H = 0.18;
    // Lower iterations for better performance on mobile
    const ITERS = window.innerWidth < 768 ? 5 : 10; 
    
    const M_RADIUS = 140;
    const M_FORCE = 5.2;
    const GRAB_R = 22;

    function gridConfig() {
      const w = window.innerWidth, h = window.innerHeight;
      // Reduce density on mobile for performance
      const isMobile = w < 768;
      const divisor = isMobile ? 30 : 18;
      const cols = Math.min(Math.max(Math.floor(w / divisor), 10), isMobile ? 30 : 70);
      const rows = Math.min(Math.max(Math.floor(h / divisor), 10), isMobile ? 25 : 40);
      const cw = w / (cols + 1);
      const rh = h / (rows - 1) * 0.9;
      return { cols, rows, cw, rh };
    }

    class Point {
      x: number; y: number; ox: number; oy: number;
      ax: number; ay: number; pinned: boolean; _wasPinned?: boolean;
      constructor(x: number, y: number, pinned: boolean) {
        this.x = x; this.y = y;
        this.ox = x; this.oy = y;
        this.ax = 0; this.ay = 0;
        this.pinned = pinned;
      }
      update() {
        if (this.pinned) return;
        const vx = (this.x - this.ox) * DAMPING;
        const vy = (this.y - this.oy) * DAMPING;
        this.ox = this.x; this.oy = this.y;
        this.x += vx + this.ax;
        this.y += vy + this.ay + GRAVITY;
        this.ax = 0; this.ay = 0;
      }
      push(fx: number, fy: number) { this.ax += fx; this.ay += fy; }
    }

    class Spring {
      a: Point; b: Point; rest: number; k: number;
      constructor(a: Point, b: Point, stiffness: number) {
        this.a = a; this.b = b;
        this.rest = Math.hypot(b.x - a.x, b.y - a.y);
        this.k = stiffness;
      }
      solve() {
        const dx = this.b.x - this.a.x;
        const dy = this.b.y - this.a.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.0001) return;
        const f = ((d - this.rest) / d) * this.k;
        if (!this.a.pinned) { this.a.x += dx * f; this.a.y += dy * f; }
        if (!this.b.pinned) { this.b.x -= dx * f; this.b.y -= dy * f; }
      }
    }

    let points: { pt: Point, ch: string }[][] = [];
    let springs: Spring[] = [];
    let G: { cols: number, rows: number, cw: number, rh: number };

    const mouse = { x: -9999, y: -9999, grabbed: null as Point | null };

    const glyphMap: Record<string, HTMLCanvasElement> = {};
    function glyph(ch: string, sz: number) {
      const key = ch + sz;
      if (glyphMap[key]) return glyphMap[key];
      const cell = Math.ceil(sz * 1.6);
      const off = document.createElement('canvas');
      off.width = off.height = cell * DPR;
      const g = off.getContext('2d');
      if (g) {
        g.scale(DPR, DPR);
        g.font = `bold ${sz}px "Courier New", monospace`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillStyle = 'rgba(210,220,240,0.86)';
        g.fillText(ch, cell / 2, cell / 2);
      }
      // @ts-ignore
      off._s = cell;
      return (glyphMap[key] = off);
    }

    function fontSize() { return Math.min(Math.max(G.rh * 0.72, 8), 16); }

    function prewarmGlyphs() {
      const sz = fontSize();
      for (const ch of new Set(SOURCE.replace(/\s+/g, ''))) {
        if (ch.trim()) glyph(ch, sz);
      }
    }

    function buildGrid() {
      G = gridConfig();
      points = [];
      springs = [];
      W = window.innerWidth;
      H = window.innerHeight;

      canvas!.width = W * DPR;
      canvas!.height = H * DPR;
      canvas!.style.width = W + 'px';
      canvas!.style.height = H + 'px';
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);

      const pool = SOURCE.replace(/\s+/g, '').split('').filter(c => c.trim());

      for (let c = 0; c < G.cols; c++) {
        const col = [];
        for (let r = 0; r < G.rows; r++) {
          const x = G.cw * (c + 1);
          const y = G.rh * r;
          const pt = new Point(x, y, r === 0);
          const ch = pool[(c * G.rows + r) % pool.length];
          col.push({ pt, ch });
        }
        points.push(col);
      }

      for (let c = 0; c < G.cols; c++) {
        for (let r = 0; r < G.rows - 1; r++) {
          springs.push(new Spring(points[c][r].pt, points[c][r + 1].pt, STIFF_V));
        }
      }

      for (let c = 0; c < G.cols - 1; c++) {
        for (let r = 0; r < G.rows; r += 2) {
          springs.push(new Spring(points[c][r].pt, points[c + 1][r].pt, STIFF_H));
        }
      }
      prewarmGlyphs();
    }

    buildGrid();

    function nearestPoint(mx: number, my: number, maxD: number) {
      let best = Infinity, found = null;
      for (let c = 0; c < G.cols; c++) {
        for (let r = 1; r < G.rows; r++) {
          const pt = points[c][r].pt;
          const dx = pt.x - mx, dy = pt.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < best) { best = d2; found = pt; }
        }
      }
      return (Math.sqrt(best) < maxD) ? found : null;
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (mouse.grabbed) {
        mouse.grabbed.x = e.clientX; mouse.grabbed.y = e.clientY;
        mouse.grabbed.ox = e.clientX; mouse.grabbed.oy = e.clientY;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const pt = nearestPoint(e.clientX, e.clientY, GRAB_R);
      if (pt) { pt._wasPinned = pt.pinned; pt.pinned = true; mouse.grabbed = pt; }
    };

    const onMouseUp = () => {
      if (mouse.grabbed) { mouse.grabbed.pinned = mouse.grabbed._wasPinned || false; mouse.grabbed = null; }
    };

    const onMouseLeave = () => {
      mouse.x = -9999; mouse.y = -9999;
      if (mouse.grabbed) { mouse.grabbed.pinned = mouse.grabbed._wasPinned || false; mouse.grabbed = null; }
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      mouse.x = t.clientX; mouse.y = t.clientY;
      const pt = nearestPoint(t.clientX, t.clientY, GRAB_R * 2);
      if (pt) { pt._wasPinned = pt.pinned; pt.pinned = true; mouse.grabbed = pt; }
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      mouse.x = t.clientX; mouse.y = t.clientY;
      if (mouse.grabbed) {
        mouse.grabbed.x = t.clientX; mouse.grabbed.y = t.clientY;
        mouse.grabbed.ox = t.clientX; mouse.grabbed.oy = t.clientY;
      }
    };

    const onTouchEnd = () => {
      mouse.x = -9999; mouse.y = -9999;
      if (mouse.grabbed) { mouse.grabbed.pinned = mouse.grabbed._wasPinned || false; mouse.grabbed = null; }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    function gust() {
      const amp = (Math.random() - 0.5) * 7;
      const band = Math.random() * H;
      const spread = H * 0.4;
      for (let c = 0; c < G.cols; c++) {
        for (let r = 1; r < G.rows; r++) {
          const pt = points[c][r].pt;
          const t = Math.max(0, 1 - Math.abs(pt.y - band) / spread);
          pt.push(amp * t, 0);
        }
      }
    }
    gustIntervalId = setInterval(gust, 2400);

    function simulate() {
      const mr2 = M_RADIUS * M_RADIUS;
      const mx = mouse.x, my = mouse.y;

      if (!mouse.grabbed && mx > 0) {
        for (let c = 0; c < G.cols; c++) {
          for (let r = 1; r < G.rows; r++) {
            const pt = points[c][r].pt;
            const dx = pt.x - mx, dy = pt.y - my;
            const d2 = dx * dx + dy * dy;
            if (d2 < mr2 && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const t = 1 - d / M_RADIUS;
              const str = t * t * M_FORCE;
              pt.push((dx / d) * str, (dy / d) * str);
            }
          }
        }
      }

      for (let c = 0; c < G.cols; c++) {
        for (let r = 0; r < G.rows; r++) points[c][r].pt.update();
      }

      for (let i = 0; i < ITERS; i++) {
        for (const s of springs) s.solve();
      }

      for (let c = 0; c < G.cols; c++) {
        const pt = points[c][0].pt;
        pt.x = G.cw * (c + 1); pt.y = 0;
        pt.ox = pt.x; pt.oy = pt.y;
      }
    }

    function draw() {
      ctx!.fillStyle = '#0d0d12';
      ctx!.fillRect(0, 0, W, H);

      const bg = ctx!.createRadialGradient(W / 2, -H * 0.1, 0, W / 2, H * 0.4, H);
      bg.addColorStop(0, 'rgba(60,40,120,0.35)');
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, W, H);

      const sz = fontSize();
      const m2 = M_RADIUS * M_RADIUS;

      for (let c = 0; c < G.cols; c++) {
        for (let r = 0; r < G.rows; r++) {
          const { pt, ch } = points[c][r];

          let alpha = 0.72;
          const dx = pt.x - mouse.x, dy = pt.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < m2) {
            const t = 1 - Math.sqrt(d2) / M_RADIUS;
            alpha = 0.72 + t * 0.28;
          }

          let angle = 0;
          if (r < G.rows - 1) {
            const below = points[c][r + 1].pt;
            angle = Math.atan2(below.y - pt.y, below.x - pt.x) - Math.PI / 2;
          } else if (r > 0) {
            const above = points[c][r - 1].pt;
            angle = Math.atan2(pt.y - above.y, pt.x - above.x) - Math.PI / 2;
          }

          const g = glyph(ch, sz);
          // @ts-ignore
          const h = (g._s || 0) / 2;

          ctx!.save();
          ctx!.translate(pt.x, pt.y);
          ctx!.rotate(angle);
          ctx!.globalAlpha = alpha;
          // @ts-ignore
          ctx!.drawImage(g, -h, -h, g._s, g._s);
          ctx!.restore();
        }
      }

      ctx!.globalAlpha = 1;

      if (mouse.x > 0 && mouse.x < W) {
        const gr = ctx!.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, M_RADIUS * 0.9);
        gr.addColorStop(0, 'rgba(255,130,30,0.18)');
        gr.addColorStop(0.45, 'rgba(255,90,0,0.07)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx!.beginPath();
        ctx!.arc(mouse.x, mouse.y, M_RADIUS * 0.9, 0, Math.PI * 2);
        ctx!.fillStyle = gr;
        ctx!.fill();
      }
    }

    function loop() {
      animationFrameId = requestAnimationFrame(loop);
      simulate();
      draw();
    }
    loop();

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildGrid();
      }, 150);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(gustIntervalId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-auto"
      style={{ cursor: 'crosshair', opacity: 0.8 }} 
    />
  );
};
