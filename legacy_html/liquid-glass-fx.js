// Liquid Glass FX & Interactive Particles

// 1. Inject CSS for interactive elements
const style = document.createElement('style');
style.innerHTML = `
    /* Mouse Follower Glow */
    .mouse-follower {
        position: fixed;
        top: 0;
        left: 0;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(129, 140, 248, 0.05) 40%, transparent 70%);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s ease-out, opacity 0.3s;
        opacity: 0;
        mix-blend-mode: screen;
    }

    /* 3D Glass Tilt & Glare Effect for Cards */
    .glass-interactive {
        transition: transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s !important;
        transform-style: preserve-3d;
        position: relative;
        overflow: hidden;
    }

    .glass-interactive::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.2) 0%, transparent 40%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 10;
        mix-blend-mode: overlay;
    }

    .glass-interactive:hover::after {
        opacity: 1;
    }

    /* Universal Particle Canvas Layer */
    #global-particle-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
        opacity: 0.8;
    }
`;
document.head.appendChild(style);

// 2. Setup Mouse Follower
const follower = document.createElement('div');
follower.className = 'mouse-follower';
document.body.appendChild(follower);

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let followerX = window.innerWidth / 2;
let followerY = window.innerHeight / 2;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    follower.style.opacity = '1';
});

window.addEventListener('mouseout', () => {
    follower.style.opacity = '0';
});

// Smooth follower tracking
function animateFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.transform = `translate(calc(${followerX}px - 50%), calc(${followerY}px - 50%))`;
    requestAnimationFrame(animateFollower);
}
animateFollower();

// 3. Interactive Liquid Glass Cards (3D Tilt & Glare)
function initGlassInteractions() {
    const cards = document.querySelectorAll('.project-card, .gallery-item, .update-card, .client-card, .skill-item');

    cards.forEach(card => {
        card.classList.add('glass-interactive');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Set variables for Glare effect
            card.style.setProperty('--mouse-x', \`\${x}px\`);
            card.style.setProperty('--mouse-y', \`\${y}px\`);
            
            // Calculate 3D Tilt
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = \`perspective(1000px) rotateX(\${rotateX}deg) rotateY(\${rotateY}deg) scale3d(1.02, 1.02, 1.02)\`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = \`perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)\`;
        });
    });
}

// 4. Global Particle System
function initGlobalParticles() {
    // If the page already has #bg-canvas (like index.html), hide it so we use the global one cleanly 
    // or just repurpose it. Here we use a dedicated one to be safe.
    const oldCanvas = document.getElementById('bg-canvas');
    if (oldCanvas) oldCanvas.style.display = 'none';

    const canvas = document.createElement('canvas');
    canvas.id = 'global-particle-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Thematic colors: Cyan, Indigo, Emerald
            this.colors = ['rgba(56, 189, 248, 0.6)', 'rgba(129, 140, 248, 0.6)', 'rgba(16, 185, 129, 0.6)'];
            this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Mouse interaction
            let dx = mouseX - this.x;
            let dy = mouseY - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            
            // push particles away from mouse to simulate liquid displacement
            const maxDistance = 150;
            let force = (maxDistance - distance) / maxDistance;
            if (force < 0) force = 0;
            
            let directionX = (forceDirectionX * force * this.density);
            let directionY = (forceDirectionY * force * this.density);
            
            if (distance < maxDistance) {
                this.x -= directionX;
                this.y -= directionY;
            }
            
            // Wrap around edges
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            
            // Glowing core
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
        }
    }
    
    function init() {
        particles = [];
        const particleCount = Math.floor((width * height) / 15000); // Responsive particle count
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw connection lines
        for (let a = 0; a < particles.length; a++) {
            particles[a].update();
            particles[a].draw();
            
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(129, 140, 248, ${ 0.2 - (distance / 100) * 0.2 })`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    
    init();
    animate();
}

// 5. Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initGlassInteractions();
        initGlobalParticles();
    });
} else {
    initGlassInteractions();
    initGlobalParticles();
}

// Observer to catch dynamically added items (e.g. if gallery filters rerender items)
const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) shouldUpdate = true;
    });
    if (shouldUpdate) initGlassInteractions();
});

observer.observe(document.body, { childList: true, subtree: true });
