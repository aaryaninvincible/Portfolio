import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let mouseX = -1000;
        let mouseY = -1000;
        let isHovering = false;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isHovering = true;
        };

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
            isHovering = false;
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseout', handleMouseLeave, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });

        interface ParticleData {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            colorDark: string;
            glowDark: string;
            colorLight: string;
            glowLight: string;
            baseAlpha: number;
        }

        const colorPalette = [
            { dark: '#00f3ff', glowD: 'rgba(0, 243, 255, 0.25)', light: '#0284c7', glowL: 'rgba(2, 132, 199, 0.2)' },
            { dark: '#ff7300', glowD: 'rgba(255, 115, 0, 0.25)', light: '#e05d00', glowL: 'rgba(224, 93, 0, 0.2)' },
            { dark: '#38bdf8', glowD: 'rgba(56, 189, 248, 0.25)', light: '#0369a1', glowL: 'rgba(3, 105, 161, 0.2)' },
            { dark: '#ff9500', glowD: 'rgba(255, 149, 0, 0.25)', light: '#ea580c', glowL: 'rgba(234, 88, 12, 0.2)' },
        ];

        let particles: ParticleData[] = [];

        const init = () => {
            particles = [];
            const isMobile = width < 768;
            const count = isMobile ? 30 : 58; // Vibrant ambient particle field floating across viewport

            for (let i = 0; i < count; i++) {
                const c = colorPalette[i % colorPalette.length];
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.48,
                    vy: (Math.random() - 0.5) * 0.48,
                    radius: Math.random() * 1.5 + 1.0,
                    colorDark: c.dark,
                    glowDark: c.glowD,
                    colorLight: c.light,
                    glowLight: c.glowL,
                    baseAlpha: Math.random() * 0.4 + 0.55,
                });
            }
        };

        let animationFrameId: number;

        const render = () => {
            if (document.hidden) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            // Background fill - Pure AMOLED Black
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);

            const len = particles.length;
            const maxDist = 110;
            const maxDistSq = maxDist * maxDist;
            const mouseDistSq = 130 * 130;

            for (let i = 0; i < len; i++) {
                const p = particles[i];

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Screen boundaries bounce/wrap
                if (p.x < 0) p.x = width;
                else if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                else if (p.y > height) p.y = 0;

                // Interactive mouse repulsion
                if (isHovering) {
                    const dxm = mouseX - p.x;
                    const dym = mouseY - p.y;
                    const dsqM = dxm * dxm + dym * dym;

                    if (dsqM < mouseDistSq && dsqM > 0) {
                        const distM = Math.sqrt(dsqM);
                        const force = (130 - distM) / 130;
                        p.x -= (dxm / distM) * force * 1.5;
                        p.y -= (dym / distM) * force * 1.5;

                        // Interactive filament to mouse pointer
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 243, 255, ${0.35 * force})`;
                        ctx.lineWidth = 0.75;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouseX, mouseY);
                        ctx.stroke();
                    }
                }

                // Connect with neighbor particles
                for (let j = i + 1; j < len; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dsq = dx * dx + dy * dy;

                    if (dsq < maxDistSq) {
                        const dist = Math.sqrt(dsq);
                        const alpha = (1 - dist / maxDist) * 0.16;
                        ctx.beginPath();
                        ctx.strokeStyle = p.colorDark === '#00f3ff' ? `rgba(0, 243, 255, ${alpha})` : `rgba(255, 115, 0, ${alpha})`;
                        ctx.lineWidth = 0.7;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                // Draw Particle Core
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.colorDark;
                ctx.globalAlpha = p.baseAlpha;
                ctx.fill();

                // Draw Soft Aura
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
                ctx.fillStyle = p.glowDark;
                ctx.globalAlpha = 0.35;
                ctx.fill();

                ctx.globalAlpha = 1.0;
            }

            animationFrameId = requestAnimationFrame(render);
        };

        init();
        render();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none select-none transition-colors duration-500"
            style={{ width: '100vw', height: '100vh' }}
        />
    );
};
