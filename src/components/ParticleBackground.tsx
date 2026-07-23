import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let mouseX = -1000;
        let mouseY = -1000;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const handleMouseOut = () => {
            mouseX = -1000;
            mouseY = -1000;
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);
        window.addEventListener('resize', handleResize);

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;
            density: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                const colors = ['#ff7300', '#00f3ff', '#ffd700', '#ff9900'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.size = Math.random() * 1.4 + 0.8;
                this.speedX = Math.random() * 0.6 - 0.3;
                this.speedY = Math.random() * 0.6 - 0.3;
                this.density = (Math.random() * 20) + 1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 140;

                if (distance < maxDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    let force = (maxDistance - distance) / maxDistance;
                    if (force < 0) force = 0;

                    const directionX = (forceDirectionX * force * this.density);
                    const directionY = (forceDirectionY * force * this.density);

                    this.x -= directionX;
                    this.y -= directionY;
                }

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                if (!ctx) return;
                // Subtle outer glow aura
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 1.6, 0, Math.PI * 2);
                ctx.fillStyle = this.color === '#00f3ff' ? 'rgba(0, 243, 255, 0.15)' : 'rgba(255, 115, 0, 0.15)';
                ctx.fill();

                // Core particle
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        let particles: Particle[] = [];

        const init = () => {
            particles = [];
            const isMobile = width < 768;
            const targetCount = isMobile ? 30 : 55;
            const particleCount = Math.min(targetCount, Math.floor((width * height) / 18000));
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        let animationId: number;
        const animate = () => {
            if (!ctx) return;
            if (document.hidden) {
                animationId = requestAnimationFrame(animate);
                return;
            }

            ctx.clearRect(0, 0, width, height);

            const len = particles.length;
            for (let a = 0; a < len; a++) {
                particles[a].update();
                particles[a].draw();

                for (let b = a + 1; b < len; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < 8100) { // 90px radius
                        const distance = Math.sqrt(distSq);
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 115, 0, ${0.18 - (distance / 90) * 0.18})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
            animationId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <>
            <div className="fixed inset-0 z-0 bg-black overflow-hidden pointer-events-none select-none">
                <div className="absolute w-[80vw] sm:w-[60vw] h-[80vw] sm:h-[60vw] rounded-full blur-[90px] opacity-35 animate-blob top-[-10vw] left-[-10vw] bg-[radial-gradient(circle,rgba(255,115,0,0.35)_0%,transparent_70%)] [animation-duration:25s] [animation-delay:-5s]"></div>
                <div className="absolute w-[80vw] sm:w-[60vw] h-[80vw] sm:h-[60vw] rounded-full blur-[90px] opacity-35 animate-blob bottom-[-10vw] right-[-20vw] bg-[radial-gradient(circle,rgba(0,243,255,0.3)_0%,transparent_70%)]"></div>
            </div>
            <canvas ref={canvasRef} className="fixed inset-0 z-[1] pointer-events-none opacity-100" />
        </>
    );
};
